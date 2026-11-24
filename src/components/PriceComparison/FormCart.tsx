import React, { useEffect, useRef } from 'react'
import { useRouter } from 'expo-router'
import { Keyboard, View } from 'react-native'
import { useForm } from 'react-hook-form'

import { useInitAlert } from '@/hooks/useInitAlert'
import { CustomAlertRef } from '@/interfaces/CustomAlertRef'
import { CartFormData } from '@/interfaces/FormData/CartFormData'
import { usePriceComparisonStore } from '@/stores/PriceComparisonStore'
import { ROUTES } from '@/constants/routes'
import { INPUTS } from '@/constants/text/inputs'
import { NameField } from '@/enums/NameField'
import { CustomAlert } from '../CustomAlert'
import { CustomInput } from '../CustomInput'
import { CustomButton } from '../Button'
import { PriceComparisonEntryProps } from '@/interfaces/PriceComparisonProps'
import { FormProps } from '@/interfaces/FormProps'
import { TextWhite } from '../TextWhite'
import { validateComparisonEntry } from '@/services/PriceComparisonService'
import { ERROR } from '@/constants/text/error'
import { AlertService } from '@/services/AlertService'

export function FormCart(
  { data = undefined, buttonTitle, children }: FormProps<PriceComparisonEntryProps>
) {
  const places = usePriceComparisonStore((state) => state.places)
  const { control, setFocus, handleSubmit, reset } = useForm<CartFormData>({
    defaultValues: {
      itemName: data?.itemName ?? '',
      quantityReference: data?.quantityReference ?? '',
      pricesByPlace: places.map((place) => ({
        placeId: place.id,
        price: data?.pricesByPlace.find((item) => item.placeId === place.id)?.price ?? '',
      })),
    },
  })
  const addEntry = usePriceComparisonStore((state) => state.addEntry)
  const updateEntry = usePriceComparisonStore((state) => state.updateEntry)

  const router = useRouter()

  const alertRef = useRef<CustomAlertRef>(null)

  useInitAlert(alertRef)

  function onSubmit(formData: CartFormData): void {
    Keyboard.dismiss()

    if (!formData.itemName.trim()) {
      AlertService.ok(ERROR.alert_title, ERROR.item_name_required)
      return
    }

    // TODO por enquanto permitir salvar com preços vazios
    // if (formData.pricesByPlace.filter((prices) => (prices?.price ?? '').trim().length > 0).length === 0) {
    //   AlertService.ok(ERROR.alert_title, ERROR.price_required)
    //   return
    // }


    const pricesByPlace = (formData.pricesByPlace ?? [])
      .filter((price) => price.price.trim().length > 0)
      .map((price) => ({ placeId: price.placeId, price: price.price.trim() }))

    const validation = validateComparisonEntry(formData.itemName, pricesByPlace, places.map((place) => place.id))

    if (validation) {
      AlertService.ok(ERROR.alert_title, validation)
      return
    }

    const payload = { itemName: formData.itemName, quantityReference: formData.quantityReference?.trim() || undefined, pricesByPlace }

    const saved = data !== undefined ? updateEntry(data.id, payload) : addEntry(payload)

    if (!saved) {
      AlertService.ok(ERROR.alert_title, ERROR.save_comparison_failure)
      return
    }

    router.push(ROUTES.PriceComparison.Index)
  }

  useEffect(() => {
    if (data !== undefined) {
      reset({
        itemName: data.itemName ?? '',
        quantityReference: data.quantityReference ?? '',
        pricesByPlace: places.map((place) => ({
          placeId: place.id,
          price: data.pricesByPlace.find((item) => item.placeId === place.id)?.price ?? '',
        })),
      })
    }
  }, [data, reset])

  return (
    <View className="my-5 gap-5">
      <CustomAlert ref={alertRef} />

      <CustomInput
        control={control}
        name="itemName"
        nameField={NameField.ItemName}
        placeholder={INPUTS.placeholder.item_name}
        returnKeyType={"next"}
        onSubmit={() => setFocus('quantityReference')}
        maxLength={80}
      />

      <CustomInput
        control={control}
        name="quantityReference"
        nameField={NameField.QuantityReference}
        placeholder={INPUTS.placeholder.quantity_reference}
        returnKeyType={places.length > 0 ? "next" : "done"}
        onSubmit={() => places.length > 0 ? setFocus('pricesByPlace.0') : handleSubmit(onSubmit)()}
        maxLength={40}
      />

      {places.length === 0 &&
        <TextWhite className="mx-5 text-sm text-slate-400">Cadastre ao menos um lugar para informar preços.</TextWhite>
      }

      {places.map((place, index) => (
        <View key={place.id} className="gap-1">
          <CustomInput
            control={control}
            name={`pricesByPlace.${index}.price`}
            nameField={`${NameField.PricesByPlace} ${place.name}`}
            placeholder={INPUTS.placeholder.prices_by_place}
            keyboardType="decimal-pad"
            returnKeyType={places.length - 1 === index ? "done" : "next"}
            onSubmit={() => places.length - 1 === index ? handleSubmit(onSubmit)() : setFocus(`pricesByPlace.${index + 1}`)}
            maxLength={40}
          />
        </View>
      ))}

      <CustomButton onPress={() => handleSubmit(onSubmit)()}>
        <CustomButton.Icon>{children}</CustomButton.Icon>
        <CustomButton.Text>{buttonTitle}</CustomButton.Text>
      </CustomButton>
    </View>
  )
}
