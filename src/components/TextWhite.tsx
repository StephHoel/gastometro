import React from 'react'
import { Text } from 'react-native'
import type { ChildrenClassNameProps } from '@/interfaces/ChildrenClassNameProps'

export function TextWhite({ children, className = '' }: ChildrenClassNameProps) {
  return <Text className={`text-white ${className}`}>{children}</Text>
}