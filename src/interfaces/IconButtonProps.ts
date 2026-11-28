import type { ReactNode } from 'react'
import type { TouchableOpacityProps } from 'react-native'

export interface IconButtonProps extends TouchableOpacityProps {
  action?: () => void
  children: ReactNode
  containerClass?: string
  wrapperClass?: string
}
