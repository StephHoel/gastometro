import React from 'react'
import { View } from 'react-native'

export function Row({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <View className={`flex-row ${className}`}>{children}</View>
}