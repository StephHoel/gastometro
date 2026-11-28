import React from 'react'
import { View } from 'react-native'
import type { DividerProps } from '@/interfaces/DividerProps'

export function Divider({ className = '', testID }: DividerProps) {
  return <View testID={testID} className={`border-b border-gray-500 my-2 ${className}`} />
}