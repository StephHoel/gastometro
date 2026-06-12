import type { ReactNode } from 'react'

export interface IconButtonProps {
  action?: () => void
  children: ReactNode
  containerClass?: string
  wrapperClass?: string
}