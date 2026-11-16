import type { AccessibilityState } from 'react-native'

export interface IconsProps {
  action?: () => void
  size?: number
  color?: string
  checked?: boolean
  accessibilityLabel?: string
  accessibilityHint?: string
  accessibilityState?: AccessibilityState
}
