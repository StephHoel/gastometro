import React from 'react'
import { Text, TextProps } from 'react-native'

export function TextWhite({ children, className = '', ...props }: TextProps) {
  return <Text {...props} className={`text-white ${className}`}>{children}</Text>
}