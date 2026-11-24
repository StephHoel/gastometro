import React from 'react'
import { ScrollView } from 'react-native'

import { COLORS } from '@/constants/color'
import { Header } from '@/components/Header'
import { AddIcon } from '@/components/Icons'
import { KeyboardScreen } from '@/components/Screen'
import { FormMarket } from '@/components/PriceComparison/FormMarket'
import { SIZE } from '@/constants/size'
import { INPUTS } from '@/constants/text/inputs'

export default function AddMarket() {
  return (
    <KeyboardScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Header />

        <FormMarket buttonTitle={INPUTS.buttons.add_place}>
          <AddIcon size={SIZE.iconButton} color={COLORS.black} />
        </FormMarket>

      </ScrollView>
    </KeyboardScreen>
  )
}
