import { ReminderService } from '@/services/ReminderService'
import { TouchableOpacity, View } from 'react-native'
import { TextWhite } from '@/components/TextWhite'
import React from 'react'
import { toDisplayDate } from '@/utils/functions/DateFunctions'
import { Row } from '@/components/Row'
import { ReminderItemProps } from '@/interfaces/ReminderItemProps'
import { Delete } from '@/components/TouchableIcons'
import { useRouter } from 'expo-router'
import { SIZE } from '@/constants/size'
import { AlertService } from '@/services/AlertService'
import { ReminderOrchestrator } from '@/services/ReminderOrchestrator'

export function ReminderItem({ item }: ReminderItemProps) {
  const router = useRouter()
  const status = ReminderService.getStatus(item)

  function handleEditReminder(): void {
    router.push(`/reminders/${item.listId}/edit/${item.id}`)
  }

  function removeReminder() {
    AlertService.removeReminder(async () =>
      await ReminderOrchestrator.removeReminder(item.id)
    )
  }

  return (
    <TouchableOpacity className="bg-slate-800 rounded-lg p-3 mb-3 flex-row justify-between items-center" onPress={handleEditReminder} >
      <View>
        <TextWhite className="font-bold">{item.title}</TextWhite>
        <TextWhite className="text-slate-300 text-xs mt-1">{toDisplayDate(item.datetimeISO)}</TextWhite>
        <TextWhite className="text-slate-400 text-xs mt-1">{status}</TextWhite>
      </View>

      <Row className='gap-5 mx-4'>
        <Delete action={removeReminder} size={SIZE.iconActions} />
      </Row>
    </TouchableOpacity>
  )
}