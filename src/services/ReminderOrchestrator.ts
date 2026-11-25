import AsyncStorage from '@react-native-async-storage/async-storage'

import { PersistenceRecoveryService } from '@/services/PersistenceRecoveryService'
import { AlertService } from '@/services/AlertService'
import { NotificationService } from '@/services/NotificationService'
import { ReminderService } from '@/services/ReminderService'
import { useReminderStore } from '@/stores/ReminderStore'

import { fromDateAndTime } from '@/utils/functions/DateFunctions'

import { ReminderState } from '@/enums/ReminderState'
import { PermissionState } from '@/enums/PermissionState'
import type { ReminderProps } from '@/interfaces/ReminderProps'

import { ERROR } from '@/constants/text/error'
import { REMINDERS } from '@/constants/text/reminders'

let reminderSyncPromise: Promise<void> | null = null
let fullSyncRequested = false
const reminderSyncRequestedIds = new Set<string>()

function getReminderScheduleKey(reminder: ReminderProps): string {
  return JSON.stringify([
    reminder.id,
    reminder.title,
    reminder.datetimeISO,
    reminder.enabled,
    reminder.listId,
  ])
}

async function cancelSafely(notificationId?: string): Promise<void> {
  try {
    await NotificationService.cancelScheduled(notificationId)
  } catch (error) {
    console.error(ERROR.notification_cancel_failure, error)
  }
}

async function scheduleSafely(reminder: ReminderProps): Promise<string | null> {
  try {
    return await NotificationService.scheduleReminder(reminder)
  } catch (error) {
    console.error(ERROR.notification_schedule_failure, error)
    return null
  }
}

async function getScheduledNotifications() {
  try {
    return await NotificationService.getScheduledReminderNotifications()
  } catch (error) {
    console.error(ERROR.notification_schedule_failure, error)
    return null
  }
}

async function cancelReminderNotifications(reminder: {
  id: string
  notificationId?: string
}): Promise<boolean> {
  const scheduled = await getScheduledNotifications()

  if (reminder.notificationId) {
    await cancelSafely(reminder.notificationId)
  }
  if (scheduled) {
    for (const notification of scheduled) {
      if (notification.reminderId === reminder.id && notification.notificationId !== reminder.notificationId) {
        await cancelSafely(notification.notificationId)
      }
    }
  }
  return scheduled !== null
}

async function reconcileReminderSchedules(targetReminderIds: Set<string> | null): Promise<void> {
  const permission = await NotificationService.getPermissionState()
  if (permission === PermissionState.Unavailable) return

  const scheduled = await getScheduledNotifications()
  if (scheduled === null) return

  const reminderStore = useReminderStore.getState()
  const reminders = targetReminderIds
    ? reminderStore.reminders.filter((reminder) => targetReminderIds.has(reminder.id))
    : reminderStore.reminders
  const validReminderIds = new Set(reminderStore.reminders.map((reminder) => reminder.id))

  if (!targetReminderIds) {
    // A reconciliação global também remove notificações de lembretes já excluídos.
    for (const notification of scheduled) {
      if (notification.reminderId && !validReminderIds.has(notification.reminderId)) {
        await cancelSafely(notification.notificationId)
      }
    }
  }

  // IDs direcionados que não existem mais no store representam lembretes removidos.
  if (targetReminderIds) {
    for (const reminderId of targetReminderIds) {
      if (validReminderIds.has(reminderId)) continue
      for (const notification of scheduled) {
        if (notification.reminderId === reminderId) {
          await cancelSafely(notification.notificationId)
        }
      }
    }
  }

  for (const reminder of reminders) {
    const matches = scheduled.filter((item) => item.reminderId === reminder.id)

    if (permission !== PermissionState.Granted || !reminder.enabled) {
      for (const item of matches) {
        await cancelSafely(item.notificationId)
      }
      if (reminder.notificationId && !matches.some((item) => item.notificationId === reminder.notificationId)) {
        await cancelSafely(reminder.notificationId)
      }
      if (reminder.notificationId) {
        useReminderStore.getState().setReminderNotification(reminder.id, undefined)
      }
      continue
    }

    const expectedDate = new Date(reminder.datetimeISO)
    const expectedISO = Number.isNaN(expectedDate.getTime()) ? null : expectedDate.toISOString()
    const matching = expectedISO
      ? matches.find((item) =>
        item.title === reminder.title &&
        item.listId === reminder.listId &&
        item.datetimeISO === expectedISO
      )
      : undefined

    if (matching) {
      for (const duplicate of matches) {
        if (duplicate.notificationId !== matching.notificationId) {
          await cancelSafely(duplicate.notificationId)
        }
      }
      const latest = useReminderStore.getState().getById(reminder.id)
      if (latest && getReminderScheduleKey(latest) === getReminderScheduleKey(reminder) &&
        latest.notificationId !== matching.notificationId) {
        useReminderStore.getState().setReminderNotification(reminder.id, matching.notificationId)
      }
      continue
    }

    for (const item of matches) {
      await cancelSafely(item.notificationId)
    }
    if (reminder.notificationId && !matches.some((item) => item.notificationId === reminder.notificationId)) {
      await cancelSafely(reminder.notificationId)
    }
    if (reminder.notificationId) {
      useReminderStore.getState().setReminderNotification(reminder.id, undefined)
    }

    const scheduledId = await scheduleSafely({
      ...reminder,
      notificationId: undefined,
    })
    if (!scheduledId) continue

    // O lembrete pode ter sido editado ou removido enquanto a API nativa agendava.
    const latest = useReminderStore.getState().getById(reminder.id)
    if (!latest || getReminderScheduleKey(latest) !== getReminderScheduleKey(reminder)) {
      await cancelSafely(scheduledId)
      reminderSyncRequestedIds.add(reminder.id)
      continue
    }

    useReminderStore.getState().setReminderNotification(reminder.id, scheduledId)
  }
}

function runReminderSync(reminderId?: string): Promise<void> {
  if (reminderId) {
    reminderSyncRequestedIds.add(reminderId)
  } else {
    fullSyncRequested = true
  }

  if (reminderSyncPromise) return reminderSyncPromise

  reminderSyncPromise = (async () => {
    while (fullSyncRequested || reminderSyncRequestedIds.size > 0) {
      const isFullSync = fullSyncRequested
      fullSyncRequested = false
      const targetIds = isFullSync ? null : new Set(reminderSyncRequestedIds)
      reminderSyncRequestedIds.clear()
      await reconcileReminderSchedules(targetIds)
    }
  })().finally(() => {
    reminderSyncPromise = null
    if (fullSyncRequested || reminderSyncRequestedIds.size > 0) {
      void runReminderSync()
    }
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
    await this.syncReminder(reminderId)
    return allowed ? ReminderState.Enable : ReminderState.NoPermission
  },

  async disableReminder(reminderId: string): Promise<void> {
    const reminderStore = useReminderStore.getState()
    const reminder = reminderStore.getById(reminderId)
    if (!reminder) return

    await cancelReminderNotifications(reminder)
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
    await this.syncReminder(reminderId)
  },

  syncReminder(reminderId: string): Promise<void> {
    return runReminderSync(reminderId)
  },

  syncWithPermissions: runReminderSync,

  async cleanupOrphans(validListIds: string[]): Promise<boolean> {
    const validIds = new Set(validListIds)
    const reminderStore = useReminderStore.getState()
    let cleanupCompleted = true

    for (const reminder of reminderStore.reminders) {
      if (!validIds.has(reminder.listId)) {
        const cleanupConfirmed = await cancelReminderNotifications(reminder)
        if (cleanupConfirmed) {
          reminderStore.removeReminder(reminder.id)
        } else {
          cleanupCompleted = false
        }
      }
    }

    const reminders = useReminderStore.getState().reminders
    const orphans = reminders.filter((reminder) => !validIds.has(reminder.listId))
    if (orphans.length === 0) cleanupCompleted = true

    try {
      await AsyncStorage.setItem('gastometro-recovery-reminders-orphans', JSON.stringify(orphans))
    } catch (error) {
      PersistenceRecoveryService.report('Foram encontrados lembretes sem uma lista correspondente, mas não foi possível criar uma cópia de recuperação. Os lembretes foram mantidos para evitar perda de dados.')
      console.error('Falha ao preservar lembretes órfãos:', error)
      return false
    }

    for (const reminder of orphans) {
      await cancelReminderNotifications(reminder)
      useReminderStore.getState().removeReminder(reminder.id)
    }

    PersistenceRecoveryService.report(
      orphans.length + ' lembrete(s) sem uma lista correspondente foram removidos da coleção ativa. Uma cópia foi preservada em gastometro-recovery-reminders-orphans.',
    )

    return cleanupCompleted
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

      const updated = reminderStore.updateReminder(editingId, { title, datetimeISO })
      if (!updated) {
        AlertService.ok(ERROR.alert_title, REMINDERS.not_found)
        return false
      }

      if (updated.enabled) {
        const allowed = await this.ensurePermissionOnSave()
        if (!allowed) {
          await this.syncReminder(updated.id)
          return true
        }
      }

      await this.syncReminder(updated.id)
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

    const created = reminderStore.addReminder({ title, datetimeISO, listId })
    if (created.enabled) {
      const allowed = await this.ensurePermissionOnSave()
      if (!allowed) {
        await this.syncReminder(created.id)
        return true
      }
    }

    await this.syncReminder(created.id)
    return true
  },
}
