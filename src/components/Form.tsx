import React, { useEffect, useRef, useState } from "react"
import { Keyboard, View, type TextInput } from "react-native"
import uuid from "react-native-uuid"
import { useCartStore } from "@/stores/CartStore"
import { CustomButton as Button } from "@/components/Button"
import { CustomAlert } from "@/components/CustomAlert"
import type { CustomAlertRef } from "@/interfaces/CustomAlertRef"
import { useInitAlert } from '@/hooks/useInitAlert'
import { CustomInput } from "@/components/CustomInput"
import type { FormProps } from "@/interfaces/FormProps"
import { AlertService } from "@/services/AlertService"
import { ProductService } from "@/services/ProductService"
import { useRouter } from "expo-router"
import { HasNegativeSignal } from '@/utils/functions/MathFunctions'
import { ERROR } from '@/constants/text/error'
import { INPUTS } from '@/constants/text/inputs'

export function Form({ data = undefined, buttonTitle, children }: FormProps) {
  const [item, setItem] = useState("")
  const [qtt, setQtt] = useState("")
  const [price, setPrice] = useState("")
  const [collected, setCollected] = useState(false)

  const cartStore = useCartStore()
  const navigation = useRouter()

  const inputRef1 = useRef<TextInput | null>(null)
  const inputRef2 = useRef<TextInput | null>(null)
  const inputRef3 = useRef<TextInput | null>(null)
  const alertRef = useRef<CustomAlertRef>(null)

  useInitAlert(alertRef)

  function handleSubmit(): void {
    Keyboard.dismiss()

    const trimmedItem = item.trim()

    if (trimmedItem === "") {
      AlertService.ok(ERROR.alert_title, ERROR.required_fields)
      return
    }

    if (HasNegativeSignal(qtt) || HasNegativeSignal(price)) {
      AlertService.ok(ERROR.alert_title, ERROR.negative_value)
      return
    }

    if (ProductService.isDuplicateItem(trimmedItem, cartStore.products, data?.id)) {
      AlertService.ok(ERROR.alert_title, ERROR.duplicate_item)
      return
    }

    const product = ProductService.createOrUpdateProduct({
      id: data?.id || uuid.v4().toString(),
      item: trimmedItem,
      qtt,
      price,
      collected,
    })

    if (data !== undefined) cartStore.edit(product)
    else cartStore.add(product)

    setItem("")
    setQtt("")
    setPrice("")
    setCollected(false)

    navigation.push("/")
  }

  useEffect(() => {
    if (data !== undefined) {
      setItem(data.item)
      setQtt(data.quantity)
      setPrice(data.price)
      setCollected(data.collected)
    }
  }, [data])

  return (
    <View className="my-5 gap-5">
      <CustomAlert ref={alertRef} />

      <CustomInput
        nameField="Item"
        placeholder={INPUTS.placeholder.item}
        selfRef={inputRef1}
        returnKeyType={"next"}
        setItem={setItem}
        item={item}
        onSubmit={() => inputRef2.current?.focus()}
      />

      <CustomInput
        nameField="Quantidade"
        placeholder={INPUTS.placeholder.quantity}
        selfRef={inputRef2}
        returnKeyType={"next"}
        keyboardType={"number-pad"}
        setItem={setQtt}
        item={qtt}
        onSubmit={() => inputRef3.current?.focus()}
      />

      <CustomInput
        nameField="Preço"
        placeholder={INPUTS.placeholder.price}
        selfRef={inputRef3}
        returnKeyType={"done"}
        keyboardType={"number-pad"}
        setItem={setPrice}
        item={price}
        onSubmit={handleSubmit}
      />

      <Button onPress={handleSubmit}>
        <Button.Icon>{children}</Button.Icon>
        <Button.Text>{buttonTitle}</Button.Text>
      </Button>
    </View>
  )
}
