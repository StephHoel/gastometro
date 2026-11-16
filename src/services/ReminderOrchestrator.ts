import { ReminderState } from '@/enums/ReminderState'
import { PermissionState } from '@/enums/PermissionState'
import { ERROR } from '@/constants/text/error'
import { REMINDERS } from '@/constants/text/reminders'
import { AlertService } from '@/services/AlertService'
import { NotificationService } from '@/services/NotificationService'
import { ReminderService } from '@/services/ReminderService'
import { useReminderStore } from '@/stores/ReminderStore'
import { fromDateAndTime } from '@/utils/functions/DateFunctions'

let reminderSyncPromise: Promise<void> | null = null
let reminderSyncRequested = false

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
    const matching = matches.find((item) =>
      item.title === reminder.title &&
      item.listId === reminder.listId &&
      item.datetimeISO === expectedISO
    )

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
    const reminderStore = useReminderStore.getState()
    const reminder = reminderStore.getById(reminderId)
    if (!reminder) return ReminderState.NotFound

    reminderStore.setEnabled(reminderId, true)

    const allowed = await NotificationService.ensurePermissionForScheduling()
    if (!allowed) {
      reminderStore.setReminderNotification(reminderId, undefined)
      return ReminderState.NoPermission
    }

    await NotificationService.cancelScheduled(reminder.notificationId)
    const scheduledId = await NotificationService.scheduleReminder({
      ...reminder,
      enabled: true,
      notificationId: undefined,
    })

    reminderStore.setReminderNotification(reminderId, scheduledId ?? undefined)
    return ReminderState.Enable
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

    await NotificationService.cancelScheduled(reminder.notificationId)
    reminderStore.removeReminder(reminderId)
  },

  async removeByListId(listId: string): Promise<void> {
    const reminderStore = useReminderStore.getState()
    const reminders = reminderStore.getByListId(listId)

    for (const reminder of reminders) {
      await NotificationService.cancelScheduled(reminder.notificationId)
    }

    reminderStore.removeByListId(listId)
  },

  async rescheduleReminder(reminderId: string): Promise<void> {
    const reminderStore = useReminderStore.getState()
    const reminder = reminderStore.getById(reminderId)
    if (!reminder) return

    await NotificationService.cancelScheduled(reminder.notificationId)

    if (!reminder.enabled) {
      reminderStore.setReminderNotification(reminderId, undefined)
      return
    }

    const permission = await NotificationService.getPermissionState()
    if (permission !== 'granted') {
      reminderStore.setReminderNotification(reminderId, undefined)
      return
    }

    const scheduledId = await NotificationService.scheduleReminder(reminder)
    reminderStore.setReminderNotification(reminderId, scheduledId ?? undefined)
  },

  syncWithPermissions: runReminderSync,

  async cleanupOrphans(validListIds: string[]): Promise<void> {
    const validIds = new Set(validListIds)
    const reminderStore = useReminderStore.getState()

    for (const reminder of reminderStore.reminders) {
      if (!validIds.has(reminder.listId)) {
        await NotificationService.cancelScheduled(reminder.notificationId)
        reminderStore.removeReminder(reminder.id)
      }
    }
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
          reminderStore.setReminderNotification(editingId, undefined)
          return true
        }
      }

      await this.rescheduleReminder(editingId)
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
        reminderStore.setReminderNotification(created.id, undefined)
        return true
      }
    }

    await this.rescheduleReminder(created.id)
    return true
  },
}
