import type { PropsWithChildren } from "react"

export interface FormProps<T> extends PropsWithChildren {
  data?: T
  buttonTitle: string
}