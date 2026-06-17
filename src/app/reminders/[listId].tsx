import { CustomAlert } from '@/components/CustomAlert'
import { Header } from '@/components/Header'
import { Row } from '@/components/Row'
import { Screen } from '@/components/Screen'
import { TextWhite } from '@/components/TextWhite'
import { colors } from '@/constants/color'
import { text } from '@/constants/text'
import type { CustomAlertRef } from '@/interfaces/CustomAlertRef'
import { AlertService } from '@/services/AlertService'
import { ReminderOrchestrator } from '@/services/ReminderOrchestrator'
import { ReminderService } from '@/services/ReminderService'
import { useInitAlert } from '@/hooks/useInitAlert'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useMemo, useRef, useState } from 'react'
import { FlatList, TextInput, TouchableOpacity, View } from 'react-native'
import { useCartStore } from '@/stores/CartStore'
import { useReminderStore } from '@/stores/ReminderStore'
import { makeDefaultDateTime, toDisplayDate } from '@/utils/functions/DateFunctions'

export function ListReminders() {
  const router = useRouter()
  const cartStore = useCartStore()
  const reminderStore = useReminderStore()
  const alertRef = useRef<CustomAlertRef>(null)
  useInitAlert(alertRef)

  const params = useLocalSearchParams<{ listId?: string }>()
  const listId = typeof params.listId === 'string' ? params.listId : ''

  const list = cartStore.lists.find((candidate) => candidate.id === listId)

  const defaultDateTime = makeDefaultDateTime()
  const [title, setTitle] = useState('')
  const [dateValue, setDateValue] = useState(defaultDateTime.date)
  const [timeValue, setTimeValue] = useState(defaultDateTime.time)
  const [editingId, setEditingId] = useState<string | null>(null)

  const reminders = useMemo(() => {
    const byList = reminderStore.getByListId(listId)

    return [...byList].sort((left, right) => left.datetimeISO.localeCompare(right.datetimeISO))
  }, [listId, reminderStore, reminderStore.reminders])

  function resetForm() {
    const nextDefaults = makeDefaultDateTime()
    setTitle('')
    setDateValue(nextDefaults.date)
    setTimeValue(nextDefaults.time)
    setEditingId(null)
  }

  function fillFormFromReminder(reminderId: string) {
    const reminder = reminderStore.getById(reminderId)
    if (!reminder) return

    const values = ReminderService.toDateInputValue(reminder.datetimeISO)
    setTitle(reminder.title)
    setDateValue(values.date)
    setTimeValue(values.time)
    setEditingId(reminder.id)
  }

  async function handleSaveReminder() {
    if (!list) {
      AlertService.ok(text.error.alert_title, text.reminders.list_required)
      return
    }

    const datetimeISO = ReminderService.fromDateAndTime(dateValue, timeValue)
    if (!datetimeISO) {
      AlertService.ok(text.error.alert_title, text.reminders.invalid_datetime)
      return
    }

    if (editingId) {
      const validationError = ReminderService.validateUpdateInput({ title, datetimeISO })
      if (validationError) {
        AlertService.ok(text.error.alert_title, validationError)
        return
      }

      const updated = reminderStore.updateReminder(editingId, {
        title,
        datetimeISO,
      })

      if (!updated) {
        AlertService.ok(text.error.alert_title, text.reminders.not_found)
        return
      }

      await ReminderOrchestrator.rescheduleReminder(editingId)
      resetForm()
      return
    }

    const validationError = ReminderService.validateCreateInput({
      title,
      datetimeISO,
      listId: list.id,
    })

    if (validationError) {
      AlertService.ok(text.error.alert_title, validationError)
      return
    }

    reminderStore.addReminder({
      title,
      datetimeISO,
      listId: list.id,
    })

    resetForm()
  }

  async function handleToggleReminder(reminderId: string, enabled: boolean) {
    if (!enabled) {
      const result = await ReminderOrchestrator.enableReminder(reminderId)
      if (result === 'no-permission') {
        AlertService.ok(text.reminders.permission_title, text.reminders.permission_denied_message)
      }
      return
    }

    await ReminderOrchestrator.disableReminder(reminderId)
  }

  function handleRemoveReminder(reminderId: string) {
    alertRef.current?.showAlert({
      title: text.reminders.remove_title,
      message: text.reminders.remove_message,
      buttons: [
        {
          text: text.reminders.remove_button,
          action: async () => {
            await ReminderOrchestrator.removeReminder(reminderId)
            if (editingId === reminderId) {
              resetForm()
            }
          },
        },
      ],
    })
  }

  if (!list) {
    return (
      <>
        <CustomAlert ref={alertRef} />

        <Screen>
          <Header />
          <View className="px-4 py-6 gap-4">
            <TextWhite>{text.reminders.invalid_list}</TextWhite>
            <TouchableOpacity
              className="bg-lime-400 rounded-lg px-3 py-2 self-start"
              onPress={() => router.push('/lists')}
            >
              <TextWhite className="text-black">{text.reminders.back_to_lists}</TextWhite>
            </TouchableOpacity>
          </View>
        </Screen>
      </>
    )
  }

  return (
    <>
      <CustomAlert ref={alertRef} />

      <Screen>
        <Header />

        <View className="px-4 pt-4 pb-2 gap-2">
          <TextWhite className="text-lg font-bold">{text.reminders.list_title(list.name)}</TextWhite>
          <TextWhite className="text-slate-400 text-xs">{text.reminders.list_hint}</TextWhite>
        </View>

        <View className="mx-4 mb-4 bg-slate-800 rounded-lg p-3 gap-2">
          <TextInput
            className="bg-slate-700 text-white rounded-lg px-3 py-2"
            placeholder={text.reminders.title_placeholder}
            placeholderTextColor={colors.inactive}
            value={title}
            onChangeText={setTitle}
            maxLength={60}
          />

          <Row className="gap-2">
            <TextInput
              className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2"
              placeholder={text.reminders.date_placeholder}
              placeholderTextColor={colors.inactive}
              value={dateValue}
              onChangeText={setDateValue}
              maxLength={10}
            />
            <TextInput
              className="w-24 bg-slate-700 text-white rounded-lg px-3 py-2"
              placeholder={text.reminders.time_placeholder}
              placeholderTextColor={colors.inactive}
              value={timeValue}
              onChangeText={setTimeValue}
              maxLength={5}
            />
          </Row>

          <Row className="gap-2 mt-1">
            <TouchableOpacity
              className="bg-lime-400 rounded-lg px-3 py-2"
              onPress={() => {
                void handleSaveReminder()
              }}
            >
              <TextWhite className="text-black font-bold">
                {editingId ? text.reminders.update_button : text.reminders.create_button}
              </TextWhite>
            </TouchableOpacity>

            {editingId && (
              <TouchableOpacity className="bg-slate-500 rounded-lg px-3 py-2" onPress={resetForm}>
                <TextWhite>{text.reminders.cancel_edit_button}</TextWhite>
              </TouchableOpacity>
            )}
          </Row>
        </View>

        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          ListEmptyComponent={
            <TextWhite className="text-slate-400 mt-2">{text.reminders.empty_list}</TextWhite>
          }
          renderItem={({ item }) => {
            const overdue = ReminderService.isOverdue(item)
            const status = overdue
              ? text.reminders.status_overdue
              : item.enabled
                ? item.notificationId
                  ? text.reminders.status_scheduled
                  : text.reminders.status_not_scheduled
                : text.reminders.status_disabled

            return (
              <View className="bg-slate-800 rounded-lg p-3 mb-3">
                <TextWhite className="font-bold">{item.title}</TextWhite>
                <TextWhite className="text-slate-300 text-xs mt-1">{toDisplayDate(item.datetimeISO)}</TextWhite>
                <TextWhite className="text-slate-400 text-xs mt-1">{status}</TextWhite>

                <Row className="gap-2 mt-3">
                  <TouchableOpacity
                    className={`rounded px-2 py-1 ${item.enabled ? 'bg-zinc-500' : 'bg-lime-400'}`}
                    onPress={() => {
                      void handleToggleReminder(item.id, item.enabled)
                    }}
                  >
                    <TextWhite className={item.enabled ? 'text-white text-xs' : 'text-black text-xs'}>
                      {item.enabled ? text.reminders.disable_button : text.reminders.enable_button}
                    </TextWhite>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-slate-500 rounded px-2 py-1"
                    onPress={() => fillFormFromReminder(item.id)}
                  >
                    <TextWhite className="text-xs">{text.reminders.edit_button}</TextWhite>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-red-600 rounded px-2 py-1"
                    onPress={() => handleRemoveReminder(item.id)}
                  >
                    <TextWhite className="text-xs">{text.reminders.remove_button}</TextWhite>
                  </TouchableOpacity>
                </Row>
              </View>
            )
          }}
        />
      </Screen>
    </>
  )
}
