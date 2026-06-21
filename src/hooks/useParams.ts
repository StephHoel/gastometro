import { useLocalSearchParams } from 'expo-router'

export function useListIdParam(): string {
  const params = useLocalSearchParams<{ listId?: string }>()
  return typeof params.listId === 'string' ? params.listId : ''
}

export function useReminderIdParam(): string {
  const params = useLocalSearchParams<{ reminderId?: string }>()
  return typeof params.reminderId === 'string' ? params.reminderId : ''
}
