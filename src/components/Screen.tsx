import React from 'react'
import { View, KeyboardAvoidingView, Platform } from 'react-native'
import type { ChildrenClassNameProps } from '@/interfaces/ChildrenClassNameProps'
import type { KeyboardScreenProps } from '@/interfaces/KeyboardScreenProps'

export function Screen({ children, className = '' }: ChildrenClassNameProps) {
  return <View className={`flex-1 bg-slate-900 ${className}`}>{children}</View>
}

export function KeyboardScreen({ children, className = '', behavior, keyboardVerticalOffset = 100 }: KeyboardScreenProps) {
  const b = behavior ?? (Platform.OS === 'ios' ? 'padding' : 'height')
  return (
    <KeyboardAvoidingView className={`flex-1 bg-slate-900 ${className}`} behavior={b} keyboardVerticalOffset={keyboardVerticalOffset}>
      {children}
    </KeyboardAvoidingView>
  )
}