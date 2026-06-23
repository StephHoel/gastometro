import React, { useEffect, useRef, useState } from 'react'
import { View, type TextInput } from 'react-native'
import { REMINDERS } from '@/constants/text/reminders'
import { makeDefaultDateTime, toDateInputValue } from '@/utils/functions/DateFunctions'
import { ReminderOrchestrator } from '@/services/ReminderOrchestrator'
import { useReminderStore } from '@/stores/ReminderStore'
import { CustomInput } from '@/components/CustomInput'
import { NameField } from '@/enums/NameField'
import { CustomButton as Button } from "@/components/Button"
import type { FormReminderProps } from '@/interfaces/FormReminderProps'
import { useRouter } from 'expo-router'
import { TrashIcon } from '@/components/Icons'
import { COLORS } from '@/constants/color'
import { SIZE } from '@/constants/size'
import { Row } from '@/components/Row'
import { AlertService } from '@/services/AlertService'

export function FormReminder({ listId, reminderId, textButton, iconButton, includeDeleteButton }: FormReminderProps) {
  const reminderStore = useReminderStore()
  const router = useRouter()

  const inputRef1 = useRef<TextInput | null>(null)
  const inputRef2 = useRef<TextInput | null>(null)
  const inputRef3 = useRef<TextInput | null>(null)

  const defaultDateTime = makeDefaultDateTime()
  const [title, setTitle] = useState('')
  const [dateValue, setDateValue] = useState(defaultDateTime.date)
  const [timeValue, setTimeValue] = useState(defaultDateTime.time)
  const [editingId, setEditingId] = useState<string | null>(null)

  const reminder = reminderStore.getById(reminderId ?? '')

  useEffect(() => {
    if (!reminder) return

    const dateValue = toDateInputValue(reminder.datetimeISO)
    setTitle(reminder.title)
    setDateValue(dateValue.date)
    setTimeValue(dateValue.time)
    setEditingId(reminder.id)
  }, [reminder])

  async function handleSaveReminder() {
    var saved = await ReminderOrchestrator.saveReminder({
      title,
      dateValue,
      timeValue,
      listId,
      editingId,
    })

    if (saved)
      redirect()
  }

  function redirect() {
    router.push(`/reminders/${listId}`)
  }

  function handleRemoveReminder() {
    AlertService.removeReminder(async () => {
      await ReminderOrchestrator.removeReminder(reminderId ?? '')
      redirect()
    })
  }

  return (
    <View className="my-5 gap-5">
      <CustomInput
        nameField={NameField.Title}
        placeholder={REMINDERS.placeholder.title}
        maxLength={60}
        selfRef={inputRef1}
        returnKeyType={"next"}
        setItem={setTitle}
        item={title}
        onSubmit={() => inputRef2.current?.focus()}
      />

      <CustomInput
        nameField={NameField.Date}
        placeholder={REMINDERS.placeholder.date}
        maxLength={10}
        selfRef={inputRef2}
        returnKeyType={"next"}
        item={dateValue}
        setItem={setDateValue}
        onSubmit={() => inputRef3.current?.focus()}
      />

      <CustomInput
        nameField={NameField.Time}
        placeholder={REMINDERS.placeholder.time}
        maxLength={5}
        selfRef={inputRef3}
        returnKeyType={"next"}
        item={timeValue}
        setItem={setTimeValue}
        onSubmit={handleSaveReminder}
      />

      <Row>
        {includeDeleteButton && (
          <Button onPress={handleRemoveReminder} type='Fail' className='flex-1'>
            <Button.Icon>
              <TrashIcon color={COLORS.black} size={SIZE.iconButton} />
            </Button.Icon>
            <Button.Text className='text-2xl'>{REMINDERS.button.remove}</Button.Text>
          </Button>
        )}

        <Button onPress={handleSaveReminder} className='flex-1'>
          <Button.Icon>{iconButton}</Button.Icon>
          <Button.Text className='text-2xl'>{textButton}</Button.Text>
        </Button>
      </Row>
    </View>
  )
}