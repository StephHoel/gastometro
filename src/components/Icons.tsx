import React from 'react'
import type { IconsProps } from "@/interfaces/IconsProps"
import { COLORS } from '@/constants/color'

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
import List from '@/assets/svgs/list.svg'
import Notification from '@/assets/svgs/notifications.svg'
import NotificationOutline from '@/assets/svgs/notifications-outline.svg'

export function AddIcon({ size = 24, color = COLORS.white }: IconsProps) {
  return <Add width={size} height={size} color={color} />
}

export function BackIcon({ size = 24, color = COLORS.white }: IconsProps) {
  return <Back width={size} height={size} color={color} />
}

export function CalculatorIcon({ size = 24, color = COLORS.white }: IconsProps) {
  return <Calculator width={size} height={size} color={color} />
}

export function CheckboxIcon({ checked, size = 30 }: IconsProps) {
  return checked
    ? <CheckboxChecked width={size} height={size} color={COLORS.active} />
    : <CheckboxUnchecked width={size} height={size} color={COLORS.white} />
}

export function TrashIcon({ size = 24, color = COLORS.white }: IconsProps) {
  return <Trash width={size} height={size} color={color} />
}

export function EditIcon({ size = 24, color = COLORS.white }: IconsProps) {
  return <Edit width={size} height={size} color={color} />
}

export function HomeIcon({ size = 24, color = COLORS.white }: IconsProps) {
  return <Home width={size} height={size} color={color} />
}

export function ShareIcon({ size = 24, color = COLORS.white }: IconsProps) {
  return <Share width={size} height={size} color={color} />
}

export function WhatsappIcon() {
  return <Whatsapp width={18} height={18} color={COLORS.black} />
}

export function ListIcon({ size = 24, color = COLORS.white }: IconsProps) {
  return <List width={size} height={size} color={color} />
}

export function NotificationIcon({ size = 24, color = COLORS.white, checked }: IconsProps) {
  return checked
    ? <Notification width={size} height={size} color={color} />
    : <NotificationOutline width={size} height={size} color={color} />
}
