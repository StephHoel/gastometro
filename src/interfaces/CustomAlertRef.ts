import type { ShowAlertProps } from '@/interfaces/ShowAlertProps'

export interface CustomAlertRef {
  showAlert: (params: ShowAlertProps) => void
  hideAlert: () => void
}
