import { TextWhite } from '@/components/TextWhite'
import type { CustomAlertRef } from '@/interfaces/CustomAlertRef'
import { useInitAlert } from '@/hooks/useInitAlert'
import { useRouter } from 'expo-router'
import React, { useMemo, useRef } from 'react'
import { FlatList, TouchableOpacity, View } from 'react-native'
import { useCartStore } from '@/stores/CartStore'
import { useReminderStore } from '@/stores/ReminderStore'
import { REMINDERS } from '@/constants/text/reminders'
import { Add } from '@/components/TouchableIcons'
import { Page } from '@/components/Page'
import { getListIdParam } from '@/hooks/getParams'
import { ReminderItem } from '@/components/Reminder/Item'

export default function ListReminders() {
  const router = useRouter()
  const cartStore = useCartStore()
  const reminderStore = useReminderStore()
  const alertRef = useRef<CustomAlertRef>(null)
  useInitAlert(alertRef)

  const listId = getListIdParam()
  const list = cartStore.lists.find((candidate) => candidate.id === listId)

  const reminders = useMemo(() => {
    const byList = reminderStore.getByListId(listId)
    return [...byList].sort((left, right) => left.datetimeISO.localeCompare(right.datetimeISO))
  }, [listId, reminderStore, reminderStore.reminders])

  if (!list) { // TODO refatorar
    return (
      <Page alertRef={alertRef}>
        <View className="px-4 py-6 gap-4">
          <TextWhite>{REMINDERS.invalid_list}</TextWhite>
          <TouchableOpacity
            className="bg-lime-400 rounded-lg px-3 py-2 self-start"
            onPress={() => router.push('/lists')}
          >
            <TextWhite className="text-black">{REMINDERS.back_to_lists}</TextWhite>
          </TouchableOpacity>
        </View>
      </Page>
    )
  }

  return (
    <Page alertRef={alertRef}>
      <TextWhite className="px-4 pt-4 pb-2 text-lg font-bold">{REMINDERS.list_title(list.name)}</TextWhite>

      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        ListEmptyComponent={
          <TextWhite className="text-slate-400 mt-2">{REMINDERS.empty_list}</TextWhite>
        }
        renderItem={({ item }) => <ReminderItem item={item} alertRef={alertRef} />}
      />

      <Add action={() => router.push(`/reminders/${listId}/new`)} />
    </Page>
  )
}
