import { ReactNode } from 'react'

export interface FormReminderProps {
  listId: string
  reminderId?: string
  includeDeleteButton?: boolean
  textButton: string
  iconButton: ReactNode
}
