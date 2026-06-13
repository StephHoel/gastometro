import { CustomAlert } from "@/components/CustomAlert"
import type { CustomAlertRef } from "@/interfaces/CustomAlertRef"
import { Header } from "@/components/Header"
import { List } from "@/components/List"
import { useCartStore } from "@/stores/CartStore"
import { ReduceCollectedProducts, ReduceProducts, SetCurrency } from "@/utils/functions/MathFunctions"
import React, { useRef } from "react"
import { useInitAlert } from '@/hooks/useInitAlert'
import { Screen } from '@/components/Screen'
import { TextWhite } from '@/components/TextWhite'
import { View } from "react-native"
import { StackTitle } from 'expo-router/build/layouts/stack-utils'

export default function Home() {
  const cartStore = useCartStore()
  const alertRef = useRef<CustomAlertRef>(null)

  useInitAlert(alertRef)

  const totalGeral = ReduceProducts(cartStore)
  const totalColetado = ReduceCollectedProducts(cartStore)

  return (
    <>
      <StackTitle>Gastômetro</StackTitle>
      <CustomAlert ref={alertRef} />

      <Screen>
        <Header />

        <View className="flex-row flex-wrap justify-center items-center gap-x-2 pt-2 pb-4">
          <TextWhite className="text-center">Total Geral: {SetCurrency(totalGeral)}</TextWhite>
          <TextWhite className="text-center">|</TextWhite>
          <TextWhite className="text-center">Total Coletado: {SetCurrency(totalColetado)}</TextWhite>
        </View>

        <List cartStore={cartStore} />
      </Screen>
    </>
  )
}
