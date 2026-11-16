import React, { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { View, type TextInputInstance } from 'react-native'
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
import { ReminderFormData } from '@/interfaces/FormData/ReminderFormData'
import { ROUTES } from '@/constants/routes'

export function FormReminder({ listId, reminderId, textButton, iconButton, includeDeleteButton }: FormReminderProps) {
  const reminderStore = useReminderStore()
  const router = useRouter()

  const defaultDateTime = makeDefaultDateTime()
  const reminder = reminderStore.getById(reminderId ?? '')

  const { control, setFocus, handleSubmit, reset } = useForm<ReminderFormData>({
    defaultValues: {
      title: reminder?.title ?? '',
      dateValue: reminder ? toDateInputValue(reminder.datetimeISO).date : defaultDateTime.date,
      timeValue: reminder ? toDateInputValue(reminder.datetimeISO).time : defaultDateTime.time,
    },
  })

  async function onSubmit(formData: ReminderFormData): Promise<void> {
    const saved = await ReminderOrchestrator.saveReminder({
      title: formData.title,
      dateValue: formData.dateValue,
      timeValue: formData.timeValue,
      listId,
      editingId: reminderId ?? null,
    })

    if (saved)
      redirect()
  }

  function redirect() {
    router.push(ROUTES.Reminder.Id(listId))
  }

  function handleRemoveReminder() {
    AlertService.removeReminder(async () => {
      await ReminderOrchestrator.removeReminder(reminderId ?? '')
      redirect()
    })
  }

  useEffect(() => {
    if (reminder) {
      const dateValue = toDateInputValue(reminder.datetimeISO)
      reset({
        title: reminder.title,
        dateValue: dateValue.date,
        timeValue: dateValue.time,
      })
    }
  }, [reminder, reset])

  return (
    <View className="my-5 gap-5">
      <CustomInput
        control={control}
        name="title"
        nameField={NameField.Title}
        placeholder={REMINDERS.placeholder.title}
        maxLength={60}
        returnKeyType={"next"}
        onSubmit={() => setFocus("dateValue")}
      />

      <CustomInput
        control={control}
        name="dateValue"
        nameField={NameField.Date}
        placeholder={REMINDERS.placeholder.date}
        maxLength={10}
        returnKeyType={"next"}
        onSubmit={() => setFocus("timeValue")}
      />

      <CustomInput
        control={control}
        name="timeValue"
        nameField={NameField.Time}
        placeholder={REMINDERS.placeholder.time}
        maxLength={5}
        returnKeyType={"next"}
        onSubmit={() => handleSubmit(onSubmit)()}
      />

      <Row>
        {includeDeleteButton && (
          <Button onPress={handleRemoveReminder} type='Fail' className='flex-1' accessibilityLabel={'Remover lembrete ' + (reminder?.title ?? 'atual')}>
            <Button.Icon>
              <TrashIcon color={COLORS.black} size={SIZE.iconButton} />
            </Button.Icon>
            <Button.Text className='text-2xl'>{REMINDERS.button.remove}</Button.Text>
          </Button>
        )}

        <Button onPress={() => handleSubmit(onSubmit)()} className='flex-1'>
          <Button.Icon>{iconButton}</Button.Icon>
          <Button.Text className='text-2xl'>{textButton}</Button.Text>
        </Button>
      </Row>
    </View>
  )
}