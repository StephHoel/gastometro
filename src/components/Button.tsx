import { ButtonTouchableProps } from "@/interfaces/ButtonTouchableProps"
import React, { type PropsWithChildren } from "react"
import { Text, TextProps, TouchableOpacity } from "react-native"

function Button({ children, type = "Success", className, ...rest }: ButtonTouchableProps) {
  let typeColor: string

  switch (type) {
    case "Success":
      typeColor = "bg-lime-400"
      break
    case "Fail":
      typeColor = "bg-red-600"
      break
    case "Default":
      typeColor = "border border-slate-500"
      break
    case "Normal":
    default:
      typeColor = "bg-zinc-400"
      break
  }

  return (
    <TouchableOpacity
      accessibilityRole="button"
      className={`${className} h-12 ${typeColor} items-center justify-center flex-row mx-5 rounded-2xl`}
      activeOpacity={0.7}
      {...rest}
    >
      {children}
    </TouchableOpacity>
  )
}



function ButtonText({ children, className = "text-3xl" }: TextProps) {
  return (
    <Text className={`${className} text-black font-heading mx-2`}>{children}</Text>
  )
}

function ButtonIcon({ children }: PropsWithChildren) {
  return children
}

export const CustomButton = Object.assign(Button, {
  Text: ButtonText,
  Icon: ButtonIcon,
})
