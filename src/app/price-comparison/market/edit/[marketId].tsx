import React from 'react'
import { ScrollView } from 'react-native'
import { useLocalSearchParams } from "expo-router"

import { COLORS } from '@/constants/color'
import { Header } from '@/components/Header'
import { EditIcon } from '@/components/Icons'
import { KeyboardScreen } from '@/components/Screen'
import { FormMarket } from '@/components/PriceComparison/FormMarket'
import { SIZE } from '@/constants/size'
import { INPUTS } from '@/constants/text/inputs'
import { usePriceComparisonStore } from '@/stores/PriceComparisonStore'

export default function EditMarket() {
  const { marketId } = useLocalSearchParams<{ marketId: string }>()
  const places = usePriceComparisonStore((state) => state.places)
  const place = places.find((item) => item.id === marketId)

  return (
    <KeyboardScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Header />

        <FormMarket data={place} buttonTitle={INPUTS.buttons.edit_place}>
          <EditIcon size={SIZE.iconButton} color={COLORS.black} />
        </FormMarket>

      </ScrollView>
    </KeyboardScreen>
  )
}
