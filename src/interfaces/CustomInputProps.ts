import { NameField } from '@/enums/NameField'
import type { RefObject } from 'react'
import type { TextInput } from "react-native"

export interface CustomInputProps {
  nameField: NameField
  selfRef: RefObject<TextInput | null>
  placeholder: string
  maxLength?: number
  setItem: (value: string) => void
  item: string
  onSubmit: () => void
  returnKeyType: "next" | "done"
  keyboardType?: "default" | "number-pad"
}