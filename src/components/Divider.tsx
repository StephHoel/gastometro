import React from 'react'
import { View } from 'react-native'

export function Divider({ className = '' }: { className?: string }) {
    return <View className={`border-b border-gray-500 my-2 ${className}`} />
}