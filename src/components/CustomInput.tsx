import type { CustomInputProps } from "@/interfaces/CustomInputProps"
import { TextInput } from "react-native"
import { Card } from '@/components/Card'
import colors from "tailwindcss/colors"
import React from 'react'
import { TextWhite } from './TextWhite'
import { NormalizeDecimalInput } from '@/utils/functions/MathFunctions'
import { NameField } from '@/enums/NameField'
import { formatDateInput, formatTimeInput } from '@/utils/functions/DateFunctions'
import { Controller, type FieldValues } from 'react-hook-form'

export function CustomInput<TFieldValues extends FieldValues>({
  control,
  name,
  nameField,
  placeholder,
  maxLength,
  returnKeyType,
  onSubmit,
  keyboardType = "default",
}: CustomInputProps<TFieldValues>) {
  function normalizeText(text: string): string {
    if (nameField === NameField.Quantity || nameField === NameField.Price) {
      const maxDecimals = nameField === NameField.Price ? 2 : 3
      return NormalizeDecimalInput(text, maxDecimals)
    }

    if (nameField === NameField.Date)
      return formatDateInput(text)

    if (nameField === NameField.Time)
      return formatTimeInput(text)

    return text
  }

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, ref } }) => {
        const inputValue = typeof value === 'string' ? value : ''

        return (
          <Card className="mx-5 py-1 flex-row">
            <TextWhite className="p-2">{nameField}:</TextWhite>

            <TextInput
              className={"text-white flex-1 py-2 mr-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-400"}
              placeholderTextColor={colors.slate[400]}
              placeholder={placeholder}
              accessibilityLabel={String(nameField)}
              accessibilityHint={placeholder}
              importantForAccessibility="yes"
              onChangeText={(text) => onChange(normalizeText(text))}
              value={inputValue}
              accessibilityLabel={nameField + " Input"}
              maxLength={maxLength}
              ref={ref}
              keyboardType={keyboardType}
              onFocus={() => {
                if (typeof value === 'string' && (value === "0.00" || value === "0"))
                  onChange("")
              }}
              onSubmitEditing={onSubmit}
              returnKeyType={returnKeyType}
            />
          </Card>
        )
      }}
    />
  )
}