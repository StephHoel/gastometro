import { ReminderState } from '@/enums/ReminderState'
import { ERROR } from '@/constants/text/error'
import { REMINDERS } from '@/constants/text/reminders'
import { AlertService } from '@/services/AlertService'
import { NotificationService } from '@/services/NotificationService'
import { ReminderService } from '@/services/ReminderService'
import { useReminderStore } from '@/stores/ReminderStore'
import { fromDateAndTime } from '@/utils/functions/DateFunctions'

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

  async syncWithPermissions(): Promise<void> {
    const reminderStore = useReminderStore.getState()
    const permission = await NotificationService.getPermissionState()

    if (permission !== 'granted') {
      reminderStore.reminders.forEach((reminder) => {
        if (reminder.notificationId) {
          reminderStore.setReminderNotification(reminder.id, undefined)
        }
      })
      return
    }

    for (const reminder of reminderStore.reminders) {
      if (!reminder.enabled) {
        if (reminder.notificationId) {
          await NotificationService.cancelScheduled(reminder.notificationId)
          reminderStore.setReminderNotification(reminder.id, undefined)
        }
        continue
      }

      if (reminder.notificationId) {
        await NotificationService.cancelScheduled(reminder.notificationId)
      }

      const scheduledId = await NotificationService.scheduleReminder(reminder)
      reminderStore.setReminderNotification(reminder.id, scheduledId ?? undefined)
    }
  },

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
