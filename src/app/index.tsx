import type { CustomAlertRef } from "@/interfaces/CustomAlertRef"
import { List } from "@/components/List"
import { useCartStore } from "@/stores/CartStore"
import { ReduceCollectedProducts, ReduceProducts, SetCurrency } from "@/utils/functions/MathFunctions"
import React, { useRef } from "react"
import { useInitAlert } from '@/hooks/useInitAlert'
import { useReminderPendingAlerts } from '@/hooks/useReminderPendingAlerts'
import { TextWhite } from '@/components/TextWhite'
import { View } from "react-native"
import { Page } from '@/components/Page'

export default function Home() {
  const cartStore = useCartStore()
  const alertRef = useRef<CustomAlertRef>(null)

  useInitAlert(alertRef)
  useReminderPendingAlerts()

  const totalGeral = ReduceProducts(cartStore)
  const totalColetado = ReduceCollectedProducts(cartStore)

  return (
    <Page alertRef={alertRef} activeListId={cartStore.activeListId}>
      <View className="flex-row flex-wrap justify-center items-center gap-x-2 pt-2 pb-4">
        <TextWhite className="text-center">Total Geral: {SetCurrency(totalGeral)}</TextWhite>
        <TextWhite className="text-center">|</TextWhite>
        <TextWhite className="text-center">Total Coletado: {SetCurrency(totalColetado)}</TextWhite>
      </View>

      <List cartStore={cartStore} />
    </Page>
  )
}
