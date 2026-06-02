import { CustomAlert, type CustomAlertRef } from "@/components/CustomAlert"
import { Header } from "@/components/Header"
import { List } from "@/components/List"
import { useCartStore } from "@/stores/CartStore"
import { ReduceProducts, SetCurrency } from "@/utils/functions/MathFunctions"
import React, { useRef } from "react"
import { useInitAlert } from '@/hooks/useInitAlert'
import { Screen } from '@/components/Screen'
import { TextWhite } from '@/components/TextWhite'

export default function Home() {
  const cartStore = useCartStore()
  const alertRef = useRef<CustomAlertRef>(null)

  useInitAlert(alertRef)

  const total = ReduceProducts(cartStore)

  return (
    <>
      <CustomAlert ref={alertRef} />

      <Screen>
        <Header />

        <TextWhite className="text-center pt-2 pb-4">Total: {SetCurrency(total)}</TextWhite>

        <List cartStore={cartStore} />
      </Screen>
    </>
  )
}
