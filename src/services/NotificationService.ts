import type { ReminderProps } from '@/interfaces/ReminderProps'
import * as Notifications from 'expo-notifications'
import { PermissionState } from '@/enums/PermissionState'
import { IsWeb } from '@/utils/platform'
import { text } from '@/constants/text'

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
      const settings = await Notifications.getPermissionsAsync()
      if (settings.granted) return PermissionState.Granted

      if (settings.status === Notifications.PermissionStatus.DENIED) {
        return PermissionState.Denied
      }

      return PermissionState.Undetermined
    } catch (error) {
      console.error(text.error.notification_permission_read_failure, error)
      return PermissionState.Unavailable
    }
  },

  async ensurePermissionForScheduling(): Promise<boolean> {
    if (IsWeb()) return false

    try {
      const current = await Notifications.getPermissionsAsync()
      if (current.granted) return true

      const requested = await Notifications.requestPermissionsAsync()
      return requested.granted
    } catch (error) {
      console.error(text.error.notification_permission_request_failure, error)
      return false
    }
  },

  async scheduleReminder(reminder: ReminderProps): Promise<string | null> {
    if (IsWeb()) return null

    const triggerDate = getTriggerDate(reminder.datetimeISO)
    if (!triggerDate) return null

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: 'Abra sua lista para revisar os itens.',
          data: {
            [LIST_ID_KEY]: reminder.listId,
            [REMINDER_ID_KEY]: reminder.id,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      })

      return notificationId
    } catch (error) {
      console.error('Falha ao agendar notificacao local:', error)
      return null
    }
  },

  async cancelScheduled(notificationId?: string): Promise<void> {
    if (IsWeb() || !notificationId) return

    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId)
    } catch (error) {
      console.error('Falha ao cancelar notificacao local:', error)
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
