import React from 'react'
import { View } from 'react-native'
import type { ChildrenClassNameProps } from '@/interfaces/ChildrenClassNameProps'

export function Card({ children, className = '' }: ChildrenClassNameProps) {
  return <View className={`border border-white rounded-2xl ${className}`}>{children}</View>
}