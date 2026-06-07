import { Form } from "@/components/Form"
import { Header } from "@/components/Header"
import { AddIcon } from "@/components/Icons"
import { text } from "@/constants/text"
import { ScrollView } from "react-native"
import { KeyboardScreen } from '@/components/Screen'
import React from 'react'
import { colors } from '@/constants/color'

export default function Add() {
  return (
    <KeyboardScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Header />

        <Form buttonTitle={text.buttons.add}>
          <AddIcon size={32} color={colors.black} />
        </Form>
      </ScrollView>
    </KeyboardScreen>
  )
}
