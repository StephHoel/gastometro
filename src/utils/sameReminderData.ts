import { ReminderProps } from '@/interfaces/ReminderProps'
import { sameValue } from './sameValue'

export function sameReminderData(left: ReminderProps, right: ReminderProps): boolean {
  const { notificationId: _localNotificationId, ...localData } = left
  const { notificationId: _backupNotificationId, ...backupData } = right
  return sameValue(localData, backupData)
}
