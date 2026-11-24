import React from 'react'
import { ScrollView } from 'react-native'
import { useLocalSearchParams } from "expo-router"

import { COLORS } from '@/constants/color'
import { Header } from '@/components/Header'
import { EditIcon } from '@/components/Icons'
import { KeyboardScreen } from '@/components/Screen'
import { FormCart } from '@/components/PriceComparison/FormCart'
import { SIZE } from '@/constants/size'
import { INPUTS } from '@/constants/text/inputs'
import { usePriceComparisonStore } from '@/stores/PriceComparisonStore'

export default function EditCart() {
  const { cartId } = useLocalSearchParams<{ cartId: string }>()
  const entries = usePriceComparisonStore((state) => state.entries)
  const entry = entries.find((item) => item.id === cartId)

  return (
    <KeyboardScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Header />

        <FormCart data={entry} buttonTitle={INPUTS.buttons.edit_item}>
          <EditIcon size={SIZE.iconButton} color={COLORS.black} />
        </FormCart>

      </ScrollView>
    </KeyboardScreen>
  )
}