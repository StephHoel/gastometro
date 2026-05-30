import React from 'react'
import { Text } from 'react-native'

export function TextWhite({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <Text className={`text-white ${className}`}>{children}</Text>
}