import React from 'react'
import { View, KeyboardAvoidingView, Platform } from 'react-native'

export function Screen({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <View className={`flex-1 bg-slate-900 ${className}`}>{children}</View>
}

export function KeyboardScreen({ children, className = '', behavior, keyboardVerticalOffset = 100 }: {
  children: React.ReactNode
  className?: string
  behavior?: 'height' | 'position' | 'padding' | undefined
  keyboardVerticalOffset?: number
}) {
  const b = behavior ?? (Platform.OS === 'ios' ? 'padding' : 'height')
  return (
    <KeyboardAvoidingView className={`flex-1 bg-slate-900 ${className}`} behavior={b} keyboardVerticalOffset={keyboardVerticalOffset}>
      {children}
    </KeyboardAvoidingView>
  )
}