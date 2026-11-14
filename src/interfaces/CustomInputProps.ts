import { NameField } from '@/enums/NameField'
import type { RefObject } from 'react'
import type { TextInputInstance } from "react-native"
import type { Control, FieldPath, FieldValues } from 'react-hook-form'

export interface CustomInputProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  nameField: NameField
  selfRef: RefObject<TextInputInstance | null>
  placeholder: string
  maxLength?: number
  onSubmit: () => void
  returnKeyType: "next" | "done"
  keyboardType?: "default" | "number-pad"
}