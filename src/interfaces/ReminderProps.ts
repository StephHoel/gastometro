export interface ReminderProps {
  id: string
  title: string
  datetimeISO: string
  enabled: boolean
  listId: string
  itemId?: string
  notificationId?: string
  createdAt: string
  updatedAt: string
}
