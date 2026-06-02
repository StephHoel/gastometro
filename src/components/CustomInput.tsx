import type { CustomInputProps } from "@/interfaces/CustomInputProps"
import { TextInput } from "react-native"
import { Card } from '@/components/Card'
import colors from "tailwindcss/colors"
import React from 'react'
import { TextWhite } from './TextWhite'

export function CustomInput({
  nameField,
  placeholder,
  selfRef,
  returnKeyType,
  setItem,
  item,
  onSubmit,
  keyboardType = "default",
}: CustomInputProps) {
  function handleChangeText(text: string) {
    if (nameField === "Quantidade" || nameField === "Preço") {
      let filtered = text.replace(/[^0-9.,]/g, "")

      const sep = filtered.includes(",")
        ? ","
        : filtered.includes(".")
          ? "."
          : ""

      const [intPart, ...rest] = filtered.split(/[.,]/)
      let decimalPart = rest.join("")

      if (sep) {
        const maxDecimals = nameField === "Preço" ? 2 : 3
        decimalPart = decimalPart.slice(0, maxDecimals)
        filtered = intPart + "." + decimalPart
      } else {
        filtered = intPart
      }
      setItem(filtered)
    } else {
      setItem(text)
    }
  }

  return (
    <Card className="mx-5 py-1 flex-row">
      <TextWhite className="p-2">{nameField}:</TextWhite>

      <TextInput
        className={"text-white flex-1 py-2 mr-3 outline-none"}
        placeholderTextColor={colors.slate[400]}
        placeholder={placeholder}
        onChangeText={handleChangeText}
        value={item}
        ref={selfRef}
        keyboardType={keyboardType}
        onFocus={() => { if (item == "0.00" || item == "0") setItem("") }}
        onSubmitEditing={onSubmit}
        returnKeyType={returnKeyType}
      />
    </Card>
  )
}