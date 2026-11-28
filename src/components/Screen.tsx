import React from 'react'
import { View, KeyboardAvoidingView, Platform, ViewProps, KeyboardAvoidingViewProps } from 'react-native'

export function Screen({ children, className = '', ...props }: ViewProps) {
  return <View className={`flex-1 bg-slate-900 ${className}`} {...props}>{children}</View>
}

export function KeyboardScreen({ children, className = '', behavior, keyboardVerticalOffset = 100, ...props }: KeyboardAvoidingViewProps) {
  const b = behavior ?? (Platform.OS === 'ios' ? 'padding' : 'height')
  return (
    <KeyboardAvoidingView className={`flex-1 bg-slate-900 ${className}`} behavior={b} keyboardVerticalOffset={keyboardVerticalOffset} {...props}>
      {children}
    </KeyboardAvoidingView>
  )
}