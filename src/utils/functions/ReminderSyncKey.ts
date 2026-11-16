import type { ReminderProps } from '@/interfaces/ReminderProps'
import type { ShoppingListProps } from '@/interfaces/ShoppingListProps'

export function getReminderSyncSignature(
  reminders: ReminderProps[],
): string {
  return reminders
    .map((reminder) => JSON.stringify([
      reminder.id,
      reminder.title,
      reminder.datetimeISO,
      reminder.enabled,
      reminder.listId,
    ]))
    .sort()
    .join('|')
}

export function getListIdsSignature(lists: ShoppingListProps[]): string {
  return lists.map((list) => list.id).sort().join('|')
}
