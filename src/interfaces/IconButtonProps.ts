import type { ReactNode } from 'react'
import type { AccessibilityState } from 'react-native'

export interface IconButtonProps {
  action?: () => void
  children: ReactNode
  containerClass?: string
  wrapperClass?: string
  accessibilityLabel?: string
  accessibilityHint?: string
  accessibilityState?: AccessibilityState
}
