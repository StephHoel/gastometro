import { NameField } from '@/enums/NameField'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { KeyboardTypeOptions, ReturnKeyTypeOptions } from 'react-native'

export interface CustomInputProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  nameField: NameField | string
  placeholder: string
  maxLength?: number
  onSubmit: () => void
  returnKeyType: ReturnKeyTypeOptions | undefined
  keyboardType?: KeyboardTypeOptions | undefined
}