import { Header } from '@/components/Header'
import { Row } from '@/components/Row'
import { Screen } from '@/components/Screen'
import { TextWhite } from '@/components/TextWhite'
import { ReminderService } from '@/services/ReminderService'
import { useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { FlatList, TouchableOpacity, View } from 'react-native'
import { useCartStore } from '@/stores/CartStore'
import { useReminderStore } from '@/stores/ReminderStore'
import { toDisplayDate } from '@/utils/functions/DateFunctions'
import { ReminderFilter } from '@/interfaces/ReminderFilter'
import { REMINDERS } from '@/constants/text/reminders'

export default function ReminderCenter() {
  const router = useRouter()
  const cartStore = useCartStore()
  const reminderStore = useReminderStore()
  const [filter, setFilter] = useState<ReminderFilter>('all')

  const listNameMap = useMemo(() => {
    const entries = cartStore.lists.map((list): [string, string] => [list.id, list.name])
    return new Map<string, string>(entries)
  }, [cartStore.lists])

  const filteredReminders = useMemo(() => {
    const now = new Date()

    return reminderStore.reminders.filter((reminder) => {
      const overdue = ReminderService.isOverdue(reminder, now)

      if (filter === 'enabled') return reminder.enabled
      if (filter === 'disabled') return !reminder.enabled
      if (filter === 'overdue') return overdue

      return true
    })
  }, [filter, reminderStore.reminders])

  return (
    <Screen>
      <Header />

      <View className="px-4 pt-4 pb-3 gap-2">
        <TextWhite className="text-lg font-bold">{REMINDERS.center_title}</TextWhite>
        <TextWhite className="text-slate-400 text-xs">{REMINDERS.center_hint}</TextWhite>
      </View>

      <Row className="px-4 pb-3 gap-2 flex-wrap">
        {(['all', 'enabled', 'disabled', 'overdue'] as ReminderFilter[]).map((candidate) => {
          const selected = filter === candidate

          return (
            <TouchableOpacity
              key={candidate}
              className={`rounded px-2 py-1 ${selected ? 'bg-lime-400' : 'bg-slate-600'}`}
              onPress={() => setFilter(candidate)}
            >
              <TextWhite className={selected ? 'text-black text-xs' : 'text-white text-xs'}>
                {REMINDERS.filter_label[candidate]}
              </TextWhite>
            </TouchableOpacity>
          )
        })}
      </Row>

      <FlatList
        data={filteredReminders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        ListEmptyComponent={
          <TextWhite className="text-slate-400 mt-2">{REMINDERS.center_empty}</TextWhite>
        }
        renderItem={({ item }) => {
          const listName = listNameMap.get(item.listId) ?? REMINDERS.unknown_list

          return (
            <View className="bg-slate-800 rounded-lg p-3 mb-3">
              <TextWhite className="font-bold">{item.title}</TextWhite>
              <TextWhite className="text-slate-300 text-xs mt-1">{toDisplayDate(item.datetimeISO)}</TextWhite>
              <TextWhite className="text-slate-400 text-xs mt-1">{REMINDERS.in_list(listName)}</TextWhite>

              <Row className="gap-2 mt-3">
                <TouchableOpacity
                  className="bg-lime-400 rounded px-2 py-1"
                  onPress={() => router.push(`./${item.listId}`)}
                >
                  <TextWhite className="text-black text-xs">{REMINDERS.open_list_button}</TextWhite>
                </TouchableOpacity>
              </Row>
            </View>
          )
        }}
      />
    </Screen>
  )
}
