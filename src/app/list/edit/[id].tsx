import { useLocalSearchParams } from "expo-router"
import { ScrollView } from "react-native"
import { KeyboardScreen } from '@/components/Screen'

import { useCartStore } from "@/stores/CartStore"

import { Form } from "@/components/Form"
import { Header } from "@/components/Header"

import { EditIcon } from "@/components/Icons"
import { text } from "@/constants/text"
import React from 'react'
import { colors } from '@/constants/color'

export default function Edit() {
  const { id } = useLocalSearchParams()
  const cartStore = useCartStore()
  const prod = cartStore.get(id.toString())

  return (
    <KeyboardScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Header />

        <Form data={prod} buttonTitle={text.buttons.edit}>
          <EditIcon size={32} color={colors.black} />
        </Form>
      </ScrollView>
    </KeyboardScreen>
  )
}
