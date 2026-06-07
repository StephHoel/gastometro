import React from 'react'
import type { IconsProps } from "@/interfaces/IconsProps"

import Add from '@/assets/svgs/add-circle-outline.svg'
import Back from '@/assets/svgs/arrow-back.svg'
import Calculator from '@/assets/svgs/calculator.svg'
import CheckboxChecked from '@/assets/svgs/checkbox-outline.svg'
import CheckboxUnchecked from '@/assets/svgs/square-outline.svg'
import Edit from '@/assets/svgs/pencil.svg'
import Home from '@/assets/svgs/home.svg'
import Share from '@/assets/svgs/share-social-outline.svg'
import Trash from '@/assets/svgs/trash-outline.svg'
import Whatsapp from '@/assets/svgs/logo-whatsapp.svg'

export function AddIcon({ size = 24, color = "white" }: IconsProps) {
  return <Add width={size} height={size} color={color} />
}

export function BackIcon({ size = 24, color = "white" }: IconsProps) {
  return <Back width={size} height={size} color={color} />
}

export function CalculatorIcon({ size = 24, color = "white" }: IconsProps) {
  return <Calculator width={size} height={size} color={color} />
}

export function BroomIcon({ size = 24, color = "white" }: IconsProps) {
  return <Trash width={size} height={size} color={color} />
}

export function CheckboxIcon({ checked, size = 30 }: IconsProps) {
  return checked
    ? <CheckboxChecked width={size} height={size} color="#A3E635" />
    : <CheckboxUnchecked width={size} height={size} color="white" />
}

export function DeleteIcon({ size = 24, color = "white" }: IconsProps) {
  return <Trash width={size} height={size} color={color} />
}

export function EditIcon({ size = 24, color = "white" }: IconsProps) {
  return <Edit width={size} height={size} color={color} />
}

export function HomeIcon({ size = 24, color = "white" }: IconsProps) {
  return <Home width={size} height={size} color={color} />
}

export function ShareIcon({ size = 24, color = "white" }: IconsProps) {
  return <Share width={size} height={size} color={color} />
}

export function WhatsappIcon() {
  return <Whatsapp width={18} height={18} color={"black"} />
}
