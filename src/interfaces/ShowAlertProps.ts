import type { ButtonProps } from '@/interfaces/ButtonProps';

export interface ShowAlertProps {
  title: string
  message: string
  buttons?: ButtonProps[]
}