import React from 'react'
import { View, type ViewProps } from 'react-native'
import type { ChildrenClassNameProps } from '@/interfaces/ChildrenClassNameProps'

export function Row({ children, className = '', style }: ChildrenClassNameProps & ViewProps) {
  return <View className={`flex-row ${className}`} style={style}>{children}</View>
}