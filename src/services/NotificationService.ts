import type { ReminderProps } from '@/interfaces/ReminderProps'
import { PermissionState } from '@/enums/PermissionState'
import { IsWeb } from '@/utils/platform'
import { ERROR } from '@/constants/text/error'
import { REMINDERS } from '@/constants/text/reminders'
import { getPermissionsAsync, requestPermissionsAsync, scheduleNotificationAsync, SchedulableTriggerInputTypes, cancelScheduledNotificationAsync, dismissAllNotificationsAsync, getAllScheduledNotificationsAsync, PermissionStatus } from 'expo-notifications'

const LIST_ID_KEY = 'listId'
const REMINDER_ID_KEY = 'reminderId'

function getTriggerDate(datetimeISO: string): Date | null {
  const triggerDate = new Date(datetimeISO)
  if (Number.isNaN(triggerDate.getTime())) return null
  if (triggerDate.getTime() <= Date.now()) return null
  return triggerDate
}

export const NotificationService = {
  async getPermissionState(): Promise<PermissionState> {
    if (IsWeb()) return PermissionState.Unavailable

    try {
      const settings = await getPermissionsAsync()
      if (settings.granted) return PermissionState.Granted

      if (settings.status === PermissionStatus.DENIED) {
        return PermissionState.Denied
      }

      return PermissionState.Undetermined
    } catch (error) {
      console.error(ERROR.notification_permission_read_failure, error)
      return PermissionState.Unavailable
    }
  },

  async ensurePermissionForScheduling(): Promise<boolean> {
    if (IsWeb()) return false

    try {
      const current = await getPermissionsAsync()
      if (current.granted) return true

      const requested = await requestPermissionsAsync()
      return requested.granted
    } catch (error) {
      console.error(ERROR.notification_permission_request_failure, error)
      return false
    }
  },

  async getScheduledReminderNotifications(): Promise<Array<{
    notificationId: string
    reminderId: string | null
    listId: string | null
    title: string | null
    datetimeISO: string | null
  }> | null> {
    if (IsWeb()) return []

    try {
      const notifications = await getAllScheduledNotificationsAsync()
      return notifications.map((notification) => {
        const trigger = notification.trigger as unknown as { date?: Date | string | number } | null
        const rawDate = trigger?.date
        const parsedDate = rawDate === undefined ? null : new Date(rawDate)
        return {
          notificationId: notification.identifier,
          reminderId: this.getReminderIdFromNotification(notification.content.data),
          listId: this.getListIdFromNotification(notification.content.data),
          title: notification.content.title ?? null,
          datetimeISO: parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : null,
        }
      })
    } catch (error) {
      console.error(ERROR.notification_schedule_failure, error)
      return null
    }
  },

  async scheduleReminder(reminder: ReminderProps): Promise<string | null> {
    if (IsWeb()) return null

    const triggerDate = getTriggerDate(reminder.datetimeISO)
    if (!triggerDate) return null

    try {
      const notificationId = await scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: REMINDERS.notification_body,
          data: {
            [LIST_ID_KEY]: reminder.listId,
            [REMINDER_ID_KEY]: reminder.id,
          },
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
          channelId: 'default',
        },
      })

      return notificationId
    } catch (error) {
      console.error(ERROR.notification_schedule_failure, error)
      return null
    }
  },

  async cancelScheduled(notificationId?: string): Promise<void> {
    if (IsWeb() || !notificationId) return

    try {
      await cancelScheduledNotificationAsync(notificationId)
    } catch (error) {
      console.error(ERROR.notification_cancel_failure, error)
    }
  },

  async clearDeliveredNotifications(): Promise<void> {
    if (IsWeb()) return

    try {
      await dismissAllNotificationsAsync()
    } catch (error) {
      console.error(ERROR.notification_dismiss_failure, error)
    }
  },

  getListIdFromNotification(data: unknown): string | null {
    if (!data || typeof data !== 'object') return null

    const value = (data as Record<string, unknown>)[LIST_ID_KEY]
    return typeof value === 'string' ? value : null
  },

  getReminderIdFromNotification(data: unknown): string | null {
    if (!data || typeof data !== 'object') return null

    const value = (data as Record<string, unknown>)[REMINDER_ID_KEY]
    return typeof value === 'string' ? value : null
  },
}
