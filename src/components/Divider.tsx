import React from 'react'
import { View } from 'react-native'

export function Divider({ className = '', testID }: { className?: string, testID?: string }) {
  return <View testID={testID} className={`border-b border-gray-500 my-2 ${className}`} />
}