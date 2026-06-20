import { ReactNode, RefObject } from 'react'
import { CustomAlertRef } from './CustomAlertRef'

export interface PageProps {
  children: ReactNode
  activeListId?: string
  alertRef: RefObject<CustomAlertRef | null>
}