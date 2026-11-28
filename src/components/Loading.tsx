import React from 'react'
import { ActivityIndicator } from "react-native"
import { Screen } from '@/components/Screen'
import colors from "tailwindcss/colors"

export function Loading() {
  return (
    <Screen className="items-center justify-center">
      <ActivityIndicator color={colors.white} />
    </Screen>
  )
}