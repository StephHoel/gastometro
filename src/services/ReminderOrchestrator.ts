import { ReminderState } from '@/enums/ReminderState'
import { PermissionState } from '@/enums/PermissionState'
import { ERROR } from '@/constants/text/error'
import { REMINDERS } from '@/constants/text/reminders'
import { AlertService } from '@/services/AlertService'
import { NotificationService } from '@/services/NotificationService'
import { ReminderService } from '@/services/ReminderService'
import { useReminderStore } from '@/stores/ReminderStore'
import { fromDateAndTime } from '@/utils/functions/DateFunctions'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { PersistenceRecoveryService } from '@/services/PersistenceRecoveryService'

let reminderSyncPromise: Promise<void> | null = null
let reminderSyncRequested = false

async function cancelReminderNotifications(reminder: {
  id: string
  notificationId?: string
}): Promise<void> {
  const scheduled = await NotificationService.getScheduledReminderNotifications()
  if (reminder.notificationId) {
    await NotificationService.cancelScheduled(reminder.notificationId)
  }
  if (scheduled) {
    for (const notification of scheduled) {
      if (notification.reminderId === reminder.id && notification.notificationId !== reminder.notificationId) {
        await NotificationService.cancelScheduled(notification.notificationId)
      }
    }
  }
}

async function reconcileReminderSchedules(): Promise<void> {
  const permission = await NotificationService.getPermissionState()
  if (permission === PermissionState.Unavailable) return

  const scheduled = await NotificationService.getScheduledReminderNotifications()
  if (scheduled === null) return

  const reminders = useReminderStore.getState().reminders

  for (const reminder of reminders) {
    const matches = scheduled.filter((item) => item.reminderId === reminder.id)

    if (permission !== PermissionState.Granted || !reminder.enabled) {
      for (const item of matches) {
        await NotificationService.cancelScheduled(item.notificationId)
      }
      if (reminder.notificationId && !matches.some((item) => item.notificationId === reminder.notificationId)) {
        await NotificationService.cancelScheduled(reminder.notificationId)
      }
      if (reminder.notificationId) {
        useReminderStore.getState().setReminderNotification(reminder.id, undefined)
      }
      continue
    }

    const expectedDate = new Date(reminder.datetimeISO)
    const expectedISO = Number.isNaN(expectedDate.getTime()) ? null : expectedDate.toISOString()
    const matching = expectedISO ? matches.find((item) =>
      item.title === reminder.title &&
      item.listId === reminder.listId &&
      item.datetimeISO === expectedISO
    ) : undefined

    if (matching) {
      for (const duplicate of matches) {
        if (duplicate.notificationId !== matching.notificationId) {
          await NotificationService.cancelScheduled(duplicate.notificationId)
        }
      }
      if (reminder.notificationId !== matching.notificationId) {
        useReminderStore.getState().setReminderNotification(reminder.id, matching.notificationId)
      }
      continue
    }

    for (const item of matches) {
      await NotificationService.cancelScheduled(item.notificationId)
    }
    if (reminder.notificationId && !matches.some((item) => item.notificationId === reminder.notificationId)) {
      await NotificationService.cancelScheduled(reminder.notificationId)
    }
    if (reminder.notificationId) {
      useReminderStore.getState().setReminderNotification(reminder.id, undefined)
    }

    const scheduledId = await NotificationService.scheduleReminder({
      ...reminder,
      notificationId: undefined,
    })
    if (scheduledId) {
      useReminderStore.getState().setReminderNotification(reminder.id, scheduledId)
    }
  }
}

function runReminderSync(): Promise<void> {
  reminderSyncRequested = true
  if (reminderSyncPromise) return reminderSyncPromise

  reminderSyncPromise = (async () => {
    while (reminderSyncRequested) {
      reminderSyncRequested = false
      await reconcileReminderSchedules()
    }
  })().finally(() => {
    reminderSyncPromise = null
    if (reminderSyncRequested) void runReminderSync()
  })

  return reminderSyncPromise
}

export const ReminderOrchestrator = {
  async ensurePermissionOnSave(): Promise<boolean> {
    const allowed = await NotificationService.ensurePermissionForScheduling()

    if (!allowed) {
      AlertService.ok(REMINDERS.permission_title, REMINDERS.permission_denied_message)
    }

    return allowed
  },

  async enableReminder(reminderId: string): Promise<ReminderState> {
    const reminder = useReminderStore.getState().getById(reminderId)
    if (!reminder) return ReminderState.NotFound

    useReminderStore.getState().setEnabled(reminderId, true)
    const allowed = await NotificationService.ensurePermissionForScheduling()
    await this.syncWithPermissions()
    return allowed ? ReminderState.Enable : ReminderState.NoPermission
  },

  async disableReminder(reminderId: string): Promise<void> {
    const reminderStore = useReminderStore.getState()
    const reminder = reminderStore.getById(reminderId)
    if (!reminder) return

    await NotificationService.cancelScheduled(reminder.notificationId)
    reminderStore.setEnabled(reminderId, false)
    reminderStore.setReminderNotification(reminderId, undefined)
  },

  async removeReminder(reminderId: string): Promise<void> {
    const reminderStore = useReminderStore.getState()
    const reminder = reminderStore.getById(reminderId)
    if (!reminder) return

    await cancelReminderNotifications(reminder)
    reminderStore.removeReminder(reminderId)
  },

  async removeByListId(listId: string): Promise<void> {
    const reminderStore = useReminderStore.getState()
    const reminders = reminderStore.getByListId(listId)

    for (const reminder of reminders) {
      await cancelReminderNotifications(reminder)
    }

    reminderStore.removeByListId(listId)
  },

  async rescheduleReminder(reminderId: string): Promise<void> {
    if (!useReminderStore.getState().getById(reminderId)) return
    await this.syncWithPermissions()
  },

  syncWithPermissions: runReminderSync,

  async cleanupOrphans(validListIds: string[]): Promise<void> {
    const validIds = new Set(validListIds)
    const reminders = useReminderStore.getState().reminders
    const orphans = reminders.filter((reminder) => !validIds.has(reminder.listId))
    if (orphans.length === 0) return

    try {
      await AsyncStorage.setItem('gastometro-recovery-reminders-orphans', JSON.stringify(orphans))
    } catch (error) {
      PersistenceRecoveryService.report('Foram encontrados lembretes sem uma lista correspondente, mas não foi possível criar uma cópia de recuperação. Os lembretes foram mantidos para evitar perda de dados.')
      console.error('Falha ao preservar lembretes órfãos:', error)
      return
    }

    for (const reminder of orphans) {
      await cancelReminderNotifications(reminder)
      useReminderStore.getState().removeReminder(reminder.id)
    }

    PersistenceRecoveryService.report(
      orphans.length + ' lembrete(s) sem uma lista correspondente foram removidos da coleção ativa. Uma cópia foi preservada em gastometro-recovery-reminders-orphans.',
    )
  },

  async saveReminder(payload: {
    listId: string
    title: string
    dateValue: string
    timeValue: string
    editingId: string | null
  }): Promise<boolean> {
    const { listId, title, dateValue, timeValue, editingId } = payload
    const reminderStore = useReminderStore.getState()

    if (!listId) {
      AlertService.ok(ERROR.alert_title, ERROR.reminder.list_required)
      return false
    }

    const datetimeISO = fromDateAndTime(dateValue, timeValue)
    if (!datetimeISO) {
      AlertService.ok(ERROR.alert_title, ERROR.reminder.invalid_datetime)
      return false
    }

    if (editingId) {
      const validationError = ReminderService.validateUpdateInput({ title, datetimeISO })
      if (validationError) {
        AlertService.ok(ERROR.alert_title, validationError)
        return false
      }

      const updated = reminderStore.updateReminder(editingId, {
        title,
        datetimeISO,
      })

      if (!updated) {
        AlertService.ok(ERROR.alert_title, REMINDERS.not_found)
        return false
      }

      if (updated.enabled) {
        const allowed = await this.ensurePermissionOnSave()
        if (!allowed) {
          await this.syncWithPermissions()
          return true
        }
      }

      await this.syncWithPermissions()
      return true
    }

    const validationError = ReminderService.validateCreateInput({
      title,
      datetimeISO,
      listId,
    })

    if (validationError) {
      AlertService.ok(ERROR.alert_title, validationError)
      return false
    }

    const created = reminderStore.addReminder({
      title,
      datetimeISO,
      listId,
    })

    if (created.enabled) {
      const allowed = await this.ensurePermissionOnSave()
      if (!allowed) {
        await this.syncWithPermissions()
        return true
      }
    }

    await this.syncWithPermissions()
    return true
  },
}
