import React from 'react'
import { ScrollView } from "react-native"
import { Form } from "@/components/Form"
import { Header } from "@/components/Header"
import { AddIcon } from "@/components/Icons"
import { KeyboardScreen } from '@/components/Screen'

import { COLORS } from '@/constants/color'
import { INPUTS } from '@/constants/text/inputs'

export default function Add() {
  return (
    <KeyboardScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Header />

        <Form buttonTitle={INPUTS.buttons.add}>
          <AddIcon size={32} color={COLORS.black} />
        </Form>
      </ScrollView>
    </KeyboardScreen>
  )
}
