import React from 'react'
import { Text } from 'react-native'
import type { ChildrenClassNameProps } from '@/interfaces/ChildrenClassNameProps'
import type { TextProps } from 'react-native'

export function TextWhite({ children, className = '', ...rest }: ChildrenClassNameProps & TextProps) {
  return <Text className={`text-white ${className}`} {...rest}>{children}</Text>
}