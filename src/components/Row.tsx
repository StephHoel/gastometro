import React from 'react'
import { View, type ViewProps } from 'react-native'

export function Row({ children, className = '', ...props }: ViewProps) {
  return <View className={`flex-row ${className}`} {...props}>{children}</View>
}