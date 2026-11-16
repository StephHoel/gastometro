import type { TouchableOpacityProps, AccessibilityState } from 'react-native'

export interface IconsProps extends TouchableOpacityProps {
  action?: () => void
  size?: number
  color?: string
  checked?: boolean
  accessibilityLabel?: string
  accessibilityHint?: string
  accessibilityState?: AccessibilityState
}
