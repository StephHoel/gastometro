import { ReminderState } from '@/enums/ReminderState'
import { NotificationService } from '@/services/NotificationService'
import { useReminderStore } from '@/stores/ReminderStore'

export const ReminderOrchestrator = {
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
}
