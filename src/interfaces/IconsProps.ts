import type { TouchableOpacityProps } from 'react-native'

export interface IconsProps extends TouchableOpacityProps {
  action?: () => void
  size?: number
  color?: string
  checked?: boolean
}
