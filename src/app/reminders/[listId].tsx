import { CustomAlert } from '@/components/CustomAlert'
import { Header } from '@/components/Header'
import { Row } from '@/components/Row'
import { Screen } from '@/components/Screen'
import { TextWhite } from '@/components/TextWhite'
import { colors } from '@/constants/color'
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
import { ERROR } from '@/constants/text/error'
import { REMINDERS } from '@/constants/text/reminders'

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
      AlertService.ok(ERROR.alert_title, REMINDERS.list_required)
      return
    }

    const datetimeISO = ReminderService.fromDateAndTime(dateValue, timeValue)
    if (!datetimeISO) {
      AlertService.ok(ERROR.alert_title, REMINDERS.invalid_datetime)
      return
    }

    if (editingId) {
      const validationError = ReminderService.validateUpdateInput({ title, datetimeISO })
      if (validationError) {
        AlertService.ok(ERROR.alert_title, validationError)
        return
      }

      const updated = reminderStore.updateReminder(editingId, {
        title,
        datetimeISO,
      })

      if (!updated) {
        AlertService.ok(ERROR.alert_title, REMINDERS.not_found)
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
      AlertService.ok(ERROR.alert_title, validationError)
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
        AlertService.ok(REMINDERS.permission_title, REMINDERS.permission_denied_message)
      }
      return
    }

    await ReminderOrchestrator.disableReminder(reminderId)
  }

  function handleRemoveReminder(reminderId: string) {
    alertRef.current?.showAlert({
      title: REMINDERS.remove_title,
      message: REMINDERS.remove_message,
      buttons: [
        {
          text: REMINDERS.remove_button,
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
            <TextWhite>{REMINDERS.invalid_list}</TextWhite>
            <TouchableOpacity
              className="bg-lime-400 rounded-lg px-3 py-2 self-start"
              onPress={() => router.push('/lists')}
            >
              <TextWhite className="text-black">{REMINDERS.back_to_lists}</TextWhite>
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
          <TextWhite className="text-lg font-bold">{REMINDERS.list_title(list.name)}</TextWhite>
          <TextWhite className="text-slate-400 text-xs">{REMINDERS.list_hint}</TextWhite>
        </View>

        <View className="mx-4 mb-4 bg-slate-800 rounded-lg p-3 gap-2">
          <TextInput
            className="bg-slate-700 text-white rounded-lg px-3 py-2"
            placeholder={REMINDERS.title_placeholder}
            placeholderTextColor={colors.inactive}
            value={title}
            onChangeText={setTitle}
            maxLength={60}
          />

          <Row className="gap-2">
            <TextInput
              className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2"
              placeholder={REMINDERS.date_placeholder}
              placeholderTextColor={colors.inactive}
              value={dateValue}
              onChangeText={setDateValue}
              maxLength={10}
            />
            <TextInput
              className="w-24 bg-slate-700 text-white rounded-lg px-3 py-2"
              placeholder={REMINDERS.time_placeholder}
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
                {editingId ? REMINDERS.update_button : REMINDERS.create_button}
              </TextWhite>
            </TouchableOpacity>

            {editingId && (
              <TouchableOpacity className="bg-slate-500 rounded-lg px-3 py-2" onPress={resetForm}>
                <TextWhite>{REMINDERS.cancel_edit_button}</TextWhite>
              </TouchableOpacity>
            )}
          </Row>
        </View>

        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          ListEmptyComponent={
            <TextWhite className="text-slate-400 mt-2">{REMINDERS.empty_list}</TextWhite>
          }
          renderItem={({ item }) => {
            const overdue = ReminderService.isOverdue(item)
            const status = overdue
              ? REMINDERS.status_overdue
              : item.enabled
                ? item.notificationId
                  ? REMINDERS.status_scheduled
                  : REMINDERS.status_not_scheduled
                : REMINDERS.status_disabled

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
                      {item.enabled ? REMINDERS.disable_button : REMINDERS.enable_button}
                    </TextWhite>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-slate-500 rounded px-2 py-1"
                    onPress={() => fillFormFromReminder(item.id)}
                  >
                    <TextWhite className="text-xs">{REMINDERS.edit_button}</TextWhite>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-red-600 rounded px-2 py-1"
                    onPress={() => handleRemoveReminder(item.id)}
                  >
                    <TextWhite className="text-xs">{REMINDERS.remove_button}</TextWhite>
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
