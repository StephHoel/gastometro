import React from 'react'
import { View } from 'react-native'

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <View className={`border border-white rounded-2xl ${className}`}>{children}</View>
}