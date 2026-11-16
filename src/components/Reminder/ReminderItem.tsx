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
import { ROUTES } from '@/constants/routes'

export function ReminderItem({ item }: ReminderItemProps) {
  const router = useRouter()
  const status = ReminderService.getStatus(item)

  function handleEditReminder(): void {
    router.push(ROUTES.Reminder.Edit(item.listId, item.id))
  }

  function removeReminder() {
    AlertService.removeReminder(async () =>
      await ReminderOrchestrator.removeReminder(item.id)
    )
  }

  return (
    <View className="bg-slate-800 rounded-lg p-3 mb-3 flex-row justify-between items-center gap-3">
      <TouchableOpacity
        className="flex-1 min-h-11 justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-400"
        onPress={handleEditReminder}
        accessibilityRole="button"
        accessibilityLabel={`Editar lembrete ${item.title}, ${toDisplayDate(item.datetimeISO)}, ${status}`}
      >
        <TextWhite className="font-bold">{item.title}</TextWhite>
        <TextWhite className="text-slate-300 text-xs mt-1">{toDisplayDate(item.datetimeISO)}</TextWhite>
        <TextWhite className="text-slate-400 text-xs mt-1">{status}</TextWhite>
      </TouchableOpacity>

      <Row className="items-center">
        <Delete action={removeReminder} size={SIZE.iconActions} accessibilityLabel={`Remover lembrete ${item.title}`} accessibilityHint="Remove este lembrete" />
      </Row>
    </View>
  )
}