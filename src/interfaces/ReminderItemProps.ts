import { RefObject } from 'react'
import { CustomAlertRef } from './CustomAlertRef'
import { ReminderProps } from './ReminderProps'

export interface ReminderItemProps {
  item: ReminderProps
  alertRef: RefObject<CustomAlertRef | null>
}
