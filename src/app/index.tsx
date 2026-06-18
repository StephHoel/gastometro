import { CustomAlert } from "@/components/CustomAlert"
import type { CustomAlertRef } from "@/interfaces/CustomAlertRef"
import { Header } from "@/components/Header"
import { List } from "@/components/List"
import { Row } from '@/components/Row'
import { NotificationService } from '@/services/NotificationService'
import { ReminderService } from '@/services/ReminderService'
import { useCartStore } from "@/stores/CartStore"
import { useReminderStore } from '@/stores/ReminderStore'
import { ReduceCollectedProducts, ReduceProducts, SetCurrency } from "@/utils/functions/MathFunctions"
import { useRouter } from 'expo-router'
import React, { useEffect, useMemo, useRef, useState } from "react"
import { useInitAlert } from '@/hooks/useInitAlert'
import { Screen } from '@/components/Screen'
import { TextWhite } from '@/components/TextWhite'
import { TouchableOpacity, View } from "react-native"
import { PermissionState } from '@/enums/PermissionState'
import { ERROR } from '@/constants/text/error'
import { REMINDERS } from '@/constants/text/reminders'

export default function Home() {
  const router = useRouter()
  const cartStore = useCartStore()
  const reminderStore = useReminderStore()
  const alertRef = useRef<CustomAlertRef>(null)
  const [permissionState, setPermissionState] = useState<PermissionState>(PermissionState.Unavailable)

  useInitAlert(alertRef)

  const totalGeral = ReduceProducts(cartStore)
  const totalColetado = ReduceCollectedProducts(cartStore)

  useEffect(() => {
    let isMounted = true

    async function loadPermissionState() {
      try {
        const status = await NotificationService.getPermissionState()
        if (!isMounted) return
        setPermissionState(status)
      } catch (error) {
        console.error(ERROR.notification_permission_failure, error)
      }
    }

    void loadPermissionState()

    return () => {
      isMounted = false
    }
  }, [reminderStore.reminders.length])

  const activePendingReminders = useMemo(() => {
    return reminderStore
      .getByListId(cartStore.activeListId)
      .filter((reminder) => reminder.enabled)
      .filter((reminder) => ReminderService.isOverdue(reminder))
  }, [cartStore.activeListId, reminderStore, reminderStore.reminders])

  const shouldShowPending = permissionState !== PermissionState.Granted && activePendingReminders.length > 0

  return (
    <>
      <CustomAlert ref={alertRef} />

      <Screen>
        <Header />

        <View className="flex-row flex-wrap justify-center items-center gap-x-2 pt-2 pb-4">
          <TextWhite className="text-center">Total Geral: {SetCurrency(totalGeral)}</TextWhite>
          <TextWhite className="text-center">|</TextWhite>
          <TextWhite className="text-center">Total Coletado: {SetCurrency(totalColetado)}</TextWhite>
        </View>

        <Row className="px-4 pb-3">
          <TouchableOpacity
            className="bg-slate-700 rounded-lg px-3 py-2"
            onPress={() => router.push(`/reminders/${cartStore.activeListId}`)}
          >
            <TextWhite>{REMINDERS.open_list_reminders_button}</TextWhite>
          </TouchableOpacity>
        </Row>

        {shouldShowPending && (
          <View className="mx-4 mb-3 bg-amber-800/40 border border-amber-500 rounded-lg p-3">
            <TextWhite className="font-bold">{REMINDERS.pending_title}</TextWhite>
            {activePendingReminders.map((reminder) => (
              <TextWhite key={reminder.id} className="text-xs mt-1 text-amber-100">
                • {reminder.title}
              </TextWhite>
            ))}
          </View>
        )}

        <List cartStore={cartStore} />
      </Screen>
    </>
  )
}
