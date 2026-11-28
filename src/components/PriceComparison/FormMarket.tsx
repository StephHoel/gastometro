import React, { useEffect, useRef } from 'react'
import { useRouter } from 'expo-router'
import { Keyboard, View } from 'react-native'
import { useForm } from 'react-hook-form'

import { useInitAlert } from '@/hooks/useInitAlert'
import { CustomAlertRef } from '@/interfaces/CustomAlertRef'
import { MarketFormData } from '@/interfaces/FormData/MarketFormData'
import { usePriceComparisonStore } from '@/stores/PriceComparisonStore'
import { AlertService } from '@/services/AlertService'
import { ERROR } from '@/constants/text/error'
import { ROUTES } from '@/constants/routes'
import { INPUTS } from '@/constants/text/inputs'
import { NameField } from '@/enums/NameField'
import { CustomAlert } from '../CustomAlert'
import { CustomInput } from '../CustomInput'
import { CustomButton } from '../Button'
import { PriceComparisonPlaceProps } from '@/interfaces/PriceComparisonProps'
import { FormProps } from '@/interfaces/FormProps'

export function FormMarket(
  { data = undefined, buttonTitle, children }: FormProps<PriceComparisonPlaceProps>
) {
  const { control, setFocus, handleSubmit, reset } = useForm<MarketFormData>({
    defaultValues: {
      market: data?.name,
      note: data?.note,
    },
  })

  const addPlace = usePriceComparisonStore((state) => state.addPlace)
  const updatePlace = usePriceComparisonStore((state) => state.updatePlace)

  const navigation = useRouter()

  const alertRef = useRef<CustomAlertRef>(null)

  useInitAlert(alertRef)

  function onSubmit(formData: MarketFormData): void {
    Keyboard.dismiss()

    if (formData.market === undefined || formData.market.trim() === "") {
      AlertService.ok(ERROR.alert_title, ERROR.required_field('Nome do Lugar'))
      return
    }

    const saved = data !== undefined
      ? updatePlace(data?.id, { name: formData.market.trim(), note: formData.note?.trim() || undefined })
      : addPlace({ name: formData.market.trim(), note: formData.note?.trim() || undefined })

    if (!saved) {
      AlertService.ok(ERROR.alert_title, ERROR.duplicate_market_name)
      return
    }

    navigation.push(ROUTES.PriceComparison.Index)
  }

  useEffect(() => {
    if (data !== undefined) {
      reset({
        market: data.name,
        note: data.note,
      })
    }
  }, [data, reset])

  return (
    <View className="my-5 gap-5">
      <CustomAlert ref={alertRef} />

      <CustomInput
        control={control}
        name="market"
        nameField={NameField.Market}
        placeholder={INPUTS.placeholder.market_name}
        accessibilityLabel="Nome do lugar"
        accessibilityHint="Informe o nome do mercado ou estabelecimento"
        returnKeyType={"next"}
        onSubmit={() => setFocus("note")}
        maxLength={60}
      />

      <CustomInput
        control={control}
        name="note"
        nameField={NameField.Notes}
        placeholder={INPUTS.placeholder.notes}
        maxLength={120}
        returnKeyType={"done"}
        onSubmit={() => handleSubmit(onSubmit)()}
      />

      <CustomButton onPress={() => handleSubmit(onSubmit)()} accessibilityLabel={buttonTitle} accessibilityHint="Valida e salva os dados do lugar">
        <CustomButton.Icon>{children}</CustomButton.Icon>
        <CustomButton.Text>{buttonTitle}</CustomButton.Text>
      </CustomButton>
    </View>
  )
}
