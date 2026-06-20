import { CustomButton as Button } from "@/components/Button"
import { CustomInput } from "@/components/CustomInput"
import { Header } from "@/components/Header"
import { TrashIcon, CalculatorIcon } from "@/components/Icons"
import { AlertService } from "@/services/AlertService"
import { Divide, HasNegativeSignal, SetCurrency } from "@/utils/functions/MathFunctions"
import React, { useRef, useState } from "react"
import { Keyboard, ScrollView, TextInput, View } from "react-native"
import { Card } from '@/components/Card'
import { KeyboardScreen } from '@/components/Screen'
import { TextWhite } from '@/components/TextWhite'
import { COLORS } from '@/constants/color'
import { ERROR } from '@/constants/text/error'
import { NameField } from '@/enums/NameField'

export default function Calculator() {
  const [answer, setAnswer] = useState<number | null>(null)

  const [price, setPrice] = useState("")
  const [quantity, setQuantity] = useState("")

  const inputRef1 = useRef<TextInput>(null)
  const inputRef2 = useRef<TextInput>(null)

  function clear() {
    setPrice("")
    setQuantity("")
  }

  function handleToCalc() {
    Keyboard.dismiss()

    if (price === "" || quantity === "")
      return AlertService.ok(ERROR.alert_title, ERROR.required_fields)

    if (HasNegativeSignal(price) || HasNegativeSignal(quantity))
      return AlertService.ok(ERROR.alert_title, ERROR.negative_value)

    setAnswer(Divide(price, quantity))
  }

  function handleToClear() {
    Keyboard.dismiss()
    clear()
    setAnswer(null)
  }

  return (
    <KeyboardScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Header />

        <View className="mt-5 gap-5">
          <CustomInput
            nameField={NameField.Price}
            selfRef={inputRef1}
            placeholder={"Preço da Embalagem"}
            setItem={setPrice}
            item={price}
            keyboardType="number-pad"
            onSubmit={() => inputRef2.current?.focus()}
            returnKeyType={"next"}
          />

          <CustomInput
            nameField={NameField.Quantity}
            selfRef={inputRef2}
            placeholder={"Quantidade na Embalagem"}
            setItem={setQuantity}
            item={quantity}
            keyboardType="number-pad"
            onSubmit={handleToCalc}
            returnKeyType={"done"}
          />

          <View className="flex-1 flex-row justify-between">
            <Button type="Normal" onPress={handleToClear} className="flex-1 border text-sm mr-2">
              <Button.Icon><TrashIcon size={28} color={COLORS.black} /></Button.Icon>
              <Button.Text className="text-2xl">Limpar</Button.Text>
            </Button>

            <Button onPress={handleToCalc} className="flex-1 border text-xl ml-2">
              <Button.Icon><CalculatorIcon size={28} color={COLORS.black} /></Button.Icon>
              <Button.Text className="text-2xl">Calcular</Button.Text>
            </Button>
          </View>

          <Card className="mx-5 p-4">
            <TextWhite>Preço por Unidade: {answer == null ? "R$ ??" : `${SetCurrency(answer)}`}</TextWhite>
          </Card>
        </View>
      </ScrollView>
    </KeyboardScreen>
  )
}
