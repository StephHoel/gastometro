import { useLocalSearchParams } from "expo-router"
import { ScrollView } from "react-native"

import { useCartStore } from "@/stores/CartStore"

import { KeyboardScreen } from '@/components/Screen'
import { Form } from "@/components/Form"
import { Header } from "@/components/Header"
import { EditIcon } from "@/components/Icons"

import React from 'react'
import { COLORS } from '@/constants/color'
import { INPUTS } from '@/constants/text/inputs'

export default function Edit() {
  const { id } = useLocalSearchParams()
  const cartStore = useCartStore()
  const prod = cartStore.get(id.toString())

  return (
    <KeyboardScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Header />

        <Form data={prod} buttonTitle={INPUTS.buttons.edit}>
          <EditIcon size={32} color={COLORS.black} />
        </Form>
      </ScrollView>
    </KeyboardScreen>
  )
}
