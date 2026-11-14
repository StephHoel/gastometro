import type { ReactNode } from "react"
import type { TouchableOpacityProps } from "react-native"

export interface ButtonTouchableProps extends Omit<TouchableOpacityProps, "children"> {
  children?: ReactNode
  type?: "Success" | "Fail" | "Normal"
}
