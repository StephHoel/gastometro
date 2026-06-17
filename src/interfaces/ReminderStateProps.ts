import type { ReminderProps } from '@/interfaces/ReminderProps'

export interface ReminderStateProps {
  reminders: ReminderProps[]

  addReminder: (payload: { title: string; datetimeISO: string; listId: string; itemId?: string }) => ReminderProps
  updateReminder: (reminderId: string, payload: Partial<Pick<ReminderProps, 'title' | 'datetimeISO' | 'listId' | 'itemId' | 'enabled'>>) => ReminderProps | null
  setReminderNotification: (reminderId: string, notificationId?: string) => void
  removeReminder: (reminderId: string) => void
  removeByListId: (listId: string) => void
  setEnabled: (reminderId: string, enabled: boolean) => void
  getByListId: (listId: string) => ReminderProps[]
  getById: (reminderId: string) => ReminderProps | undefined
}
