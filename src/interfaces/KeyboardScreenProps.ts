import type { ChildrenClassNameProps } from '@/interfaces/ChildrenClassNameProps'

export interface KeyboardScreenProps extends ChildrenClassNameProps {
  behavior?: 'height' | 'position' | 'padding'
  keyboardVerticalOffset?: number
}