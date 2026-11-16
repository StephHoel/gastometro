import React from 'react'
import { TouchableOpacity, View } from "react-native"

import {
  AddIcon,
  BackIcon,
  TrashIcon,
  ShareIcon,
  NotificationIcon,
  EditIcon,
  CartIcon,
  MarketIcon,
  HardDriveIcon
} from "@/components/Icons"

import type { IconsProps } from "@/interfaces/IconsProps"
import type { IconButtonProps } from '@/interfaces/IconButtonProps'

import { COLORS } from '@/constants/color'

function IconButton({ action, children, containerClass, wrapperClass, accessibilityLabel, accessibilityHint, accessibilityState, ...props }: IconButtonProps) {
  return (
    <TouchableOpacity
      {...props}
      activeOpacity={0.7}
      onPress={action}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={accessibilityState}
      className={wrapperClass ?? "min-w-11 min-h-11 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-400"}
    >
      {containerClass ? (
        <View className={containerClass}>{children}</View>
      ) : (
        children
      )}
    </TouchableOpacity>
  )
}

export function Add({ action, size = 35, accessibilityLabel = 'Adicionar', ...props }: IconsProps) {
  return (
    <IconButton
      {...props}
      action={action}
      accessibilityLabel={accessibilityLabel}
      wrapperClass="absolute bottom-6 right-6 z-50 min-w-14 min-h-14 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-400"
      containerClass="bg-lime-400 rounded-full w-14 h-14 items-center justify-center"
    >
      <AddIcon size={size} color={COLORS.black} />
    </IconButton>
  )
}

export function Delete({ action, size, accessibilityLabel = 'Remover', ...props }: IconsProps) {
  return (
    <IconButton
      {...props}
      action={action}
      accessibilityLabel={accessibilityLabel}
    >
      <TrashIcon size={size} />
    </IconButton>
  )
}

export function Edit({ action, size, accessibilityLabel = 'Editar', ...props }: IconsProps) {
  return (
    <IconButton
      {...props}
      action={action}
      accessibilityLabel={accessibilityLabel}
    >
      <EditIcon size={size} />
    </IconButton>
  )
}

export function Share({ action, size, accessibilityLabel = 'Compartilhar', ...props }: IconsProps) {
  return (
    <IconButton
      {...props}
      action={action}
      accessibilityLabel={accessibilityLabel}
    >
      <ShareIcon size={size} />
    </IconButton>
  )
}

export function Back({ action, size = 35, accessibilityLabel = 'Voltar', ...props }: IconsProps) {
  return (
    <IconButton
      {...props}
      action={action}
      accessibilityLabel={accessibilityLabel}
    >
      <BackIcon size={size} />
    </IconButton>
  )
}

export function Market({ action, size = 35, accessibilityLabel = 'Lugar', ...props }: IconsProps) {
  return (
    <IconButton
      {...props}
      action={action}
      accessibilityLabel={accessibilityLabel}
    >
      <MarketIcon size={size} />
    </IconButton>
  )
}

export function Cart({ action, size = 35, accessibilityLabel = 'Carrinho', ...props }: IconsProps) {
  return (
    <IconButton
      {...props}
      action={action}
      accessibilityLabel={accessibilityLabel}
    >
      <CartIcon size={size} />
    </IconButton>
  )
}

export function Notification({ action, checked, size, accessibilityLabel = 'Lembretes', ...props }: IconsProps) {
  return (
    <IconButton
      {...props}
      action={action}
      accessibilityLabel={accessibilityLabel}
    >
      <NotificationIcon size={size} checked={checked} />
    </IconButton>
  )
}

export function Backup({ action, size, accessibilityLabel = 'Backup', ...props }: IconsProps) {
  return (
    <IconButton
      {...props}
      action={action}
      accessibilityLabel={accessibilityLabel}
    >
      <HardDriveIcon size={size} />
    </IconButton>
  )
}
