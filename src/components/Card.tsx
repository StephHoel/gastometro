import React from 'react'
import { View, ViewProps } from 'react-native'

export function Card({ children, className = '', ...props}: ViewProps) {
  return <View className={`border border-white rounded-2xl ${className}`} {...props}>{children}</View>
}