import React from 'react'
import { View } from 'react-native'
import type { ChildrenClassNameProps } from '@/interfaces/ChildrenClassNameProps'

export function Row({ children, className = '' }: ChildrenClassNameProps) {
  return <View className={`flex-row ${className}`}>{children}</View>
}