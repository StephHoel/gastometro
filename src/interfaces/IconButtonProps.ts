import type { ReactNode } from 'react'
import type { AccessibilityState, TouchableOpacityProps } from 'react-native'

export interface IconButtonProps extends TouchableOpacityProps {
  action?: () => void
  children: ReactNode
  containerClass?: string
  wrapperClass?: string
  accessibilityLabel?: string
  accessibilityHint?: string
  accessibilityState?: AccessibilityState
}
