import { REMINDERS } from '@/constants/text/reminders'
import { ReminderService } from '@/services/ReminderService'
import { View } from 'react-native'
import { TextWhite } from '../TextWhite'
import React from 'react'
import { toDisplayDate } from '@/utils/functions/DateFunctions'
import { Row } from '../Row'
import { ReminderOrchestrator } from '@/services/ReminderOrchestrator'
import { ReminderItemProps } from '@/interfaces/ReminderItemProps'
import { Delete, Edit } from '../TouchableIcons'
import { useRouter } from 'expo-router'
import { SIZE } from '@/constants/size'

export function ReminderItem({ item, alertRef }: ReminderItemProps) {
  const router = useRouter()
  const status = ReminderService.getStatus(item)

  function handleRemoveReminder() {
    alertRef.current?.showAlert({
      title: REMINDERS.remove_title,
      message: REMINDERS.remove_message,
      buttons: [
        {
          text: REMINDERS.remove_button,
          action: async () => await ReminderOrchestrator.removeReminder(item.id)
        },
      ],
    })
  }

  function handleEditReminder(): void {
    router.push(`/reminders/${item.listId}/edit/${item.id}`)
  }

  return (
    <View className="bg-slate-800 rounded-lg p-3 mb-3 flex-row justify-between items-center">
      <View>
        <TextWhite className="font-bold">{item.title}</TextWhite>
        <TextWhite className="text-slate-300 text-xs mt-1">{toDisplayDate(item.datetimeISO)}</TextWhite>
        <TextWhite className="text-slate-400 text-xs mt-1">{status}</TextWhite>
      </View>

      <Row className='gap-5 mx-4'>
        <Edit action={handleEditReminder} size={SIZE.iconActions} />
        <Delete action={handleRemoveReminder} size={SIZE.iconActions} />
      </Row>
    </View>
  )
}