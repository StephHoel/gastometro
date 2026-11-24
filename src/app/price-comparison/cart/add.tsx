import React from 'react'
import { ScrollView } from 'react-native'

import { COLORS } from '@/constants/color'
import { Header } from '@/components/Header'
import { AddIcon } from '@/components/Icons'
import { KeyboardScreen } from '@/components/Screen'
import { FormCart } from '@/components/PriceComparison/FormCart'
import { SIZE } from '@/constants/size'
import { INPUTS } from '@/constants/text/inputs'

export default function AddCart() {
  return (
    <KeyboardScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Header />

        <FormCart buttonTitle={INPUTS.buttons.add_item}>
          <AddIcon size={SIZE.iconButton} color={COLORS.black} />
        </FormCart>

      </ScrollView>
    </KeyboardScreen>
  )
}
