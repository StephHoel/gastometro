import { ReminderProps } from '@/interfaces/ReminderProps'

export function updateReminder(
  reminders: ReminderProps[],
  reminderId: string,
  updater: (reminder: ReminderProps) => ReminderProps,
) {
  return reminders.map((reminder) => (reminder.id === reminderId ? updater(reminder) : reminder))
}
