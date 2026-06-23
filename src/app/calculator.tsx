import { CustomButton as Button } from "@/components/Button"
import { CustomInput } from "@/components/CustomInput"
import { Header } from "@/components/Header"
import { TrashIcon, CalculatorIcon } from "@/components/Icons"
import { AlertService } from "@/services/AlertService"
import { Divide, HasNegativeSignal, SetCurrency } from "@/utils/functions/MathFunctions"
import React, { useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Keyboard, ScrollView, TextInput, View } from "react-native"
import { Card } from '@/components/Card'
import { KeyboardScreen } from '@/components/Screen'
import { TextWhite } from '@/components/TextWhite'
import { COLORS } from '@/constants/color'
import { ERROR } from '@/constants/text/error'
import { NameField } from '@/enums/NameField'
import { SIZE } from '@/constants/size'
import { CalculatorFormData } from '@/interfaces/FormData/CalculatorFormData'
import { CALC } from '@/constants/text/calculator'

export default function Calculator() {
  const { control, handleSubmit, watch, reset } = useForm<CalculatorFormData>({
    defaultValues: {
      price: "",
      quantity: "",
    },
  })

  const [answer, answerState] = useState<number | null>(null)

  const inputRef1 = useRef<TextInput>(null)
  const inputRef2 = useRef<TextInput>(null)

  function onCalculate(formData: CalculatorFormData): void {
    Keyboard.dismiss()

    if (formData.price === "" || formData.quantity === "")
      return AlertService.ok(ERROR.alert_title, ERROR.required_fields)

    if (HasNegativeSignal(formData.price) || HasNegativeSignal(formData.quantity))
      return AlertService.ok(ERROR.alert_title, ERROR.negative_value)

    answerState(Divide(formData.price, formData.quantity))
  }

  function handleClear(): void {
    Keyboard.dismiss()
    reset()
    answerState(null)
  }

  return (
    <KeyboardScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Header />

        <View className="mt-5 gap-5">
          <Controller
            control={control}
            name="price"
            render={({ field: { value, onChange } }) => (
              <CustomInput
                nameField={NameField.Price}
                selfRef={inputRef1}
                placeholder={CALC.placeholder.price}
                setItem={onChange}
                item={value}
                keyboardType="number-pad"
                onSubmit={() => inputRef2.current?.focus()}
                returnKeyType={"next"}
              />
            )}
          />

          <Controller
            control={control}
            name="quantity"
            render={({ field: { value, onChange } }) => (
              <CustomInput
                nameField={NameField.Quantity}
                selfRef={inputRef2}
                placeholder={CALC.placeholder.quantity}
                setItem={onChange}
                item={value}
                keyboardType="number-pad"
                onSubmit={handleSubmit(onCalculate)}
                returnKeyType={"done"}
              />
            )}
          />

          <View className="flex-1 flex-row justify-between">
            <Button type="Normal" onPress={handleClear} className="flex-1 border text-sm mr-2">
              <Button.Icon><TrashIcon size={SIZE.iconCalculator} color={COLORS.black} /></Button.Icon>
              <Button.Text className="text-2xl">{CALC.button.clear}</Button.Text>
            </Button>

            <Button onPress={handleSubmit(onCalculate)} className="flex-1 border text-xl ml-2">
              <Button.Icon><CalculatorIcon size={SIZE.iconCalculator} color={COLORS.black} /></Button.Icon>
              <Button.Text className="text-2xl">{CALC.button.submit}</Button.Text>
            </Button>
          </View>

          <Card className="mx-5 p-4">
            <TextWhite>{CALC.answer(answer == null ? "R$ ??" : `${SetCurrency(answer)}`)}</TextWhite>
          </Card>
        </View>
      </ScrollView>
    </KeyboardScreen>
  )
}
