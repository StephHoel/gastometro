import React, { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { Keyboard, View } from "react-native"
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
import { NameField } from '@/enums/NameField'
import { ProductFormData } from '@/interfaces/FormData/ProductFormData'
import { ROUTES } from '@/constants/routes'
import { ProductProps } from '@/interfaces/ProductProps'

export function Form({ data = undefined, buttonTitle, children }: FormProps<ProductProps>) {
  const { control, handleSubmit, setFocus, reset } = useForm<ProductFormData>({
    defaultValues: {
      item: data?.item ?? "",
      qtt: data?.quantity ?? "",
      price: data?.price ?? "",
      collected: data?.collected ?? false,
    },
  })

  const cartStore = useCartStore()
  const router = useRouter()

  const alertRef = useRef<CustomAlertRef>(null)

  useInitAlert(alertRef)

  function onSubmit(formData: ProductFormData): void {
    Keyboard.dismiss()

    const trimmedItem = formData.item.trim()

    if (trimmedItem === "") {
      AlertService.ok(ERROR.alert_title, ERROR.required_fields)
      return
    }

    if (HasNegativeSignal(formData.qtt) || HasNegativeSignal(formData.price)) {
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
      qtt: formData.qtt,
      price: formData.price,
      collected: formData.collected,
    })

    if (data !== undefined) cartStore.edit(product)
    else cartStore.add(product)

    reset()
    router.push(ROUTES.Index)
  }

  useEffect(() => {
    if (data !== undefined) {
      reset({
        item: data.item,
        qtt: data.quantity,
        price: data.price,
        collected: data.collected,
      })
    }
  }, [data, reset])

  return (
    <View className="my-5 gap-5">
      <CustomAlert ref={alertRef} />

      <CustomInput
        control={control}
        name="item"
        nameField={NameField.Item}
        placeholder={INPUTS.placeholder.item}
        returnKeyType={"next"}
        onSubmit={() => setFocus("qtt")}
      />

      <CustomInput
        control={control}
        name="qtt"
        nameField={NameField.Quantity}
        placeholder={INPUTS.placeholder.quantity}
        returnKeyType={"next"}
        keyboardType={"decimal-pad"}
        onSubmit={() => setFocus("price")}
      />

      <CustomInput
        control={control}
        name="price"
        nameField={NameField.Price}
        placeholder={INPUTS.placeholder.price}
        returnKeyType={"done"}
        keyboardType={"decimal-pad"}
        onSubmit={() => handleSubmit(onSubmit)()}
      />

      <Button onPress={() => handleSubmit(onSubmit)()} accessibilityLabel={data ? "Salvar alterações do produto " + data.item : "Adicionar produto à lista"}>
        <Button.Icon>{children}</Button.Icon>
        <Button.Text>{buttonTitle}</Button.Text>
      </Button>
    </View>
  )
}
