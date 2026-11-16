import { AddIcon, BackIcon, TrashIcon, ShareIcon, NotificationIcon, EditIcon } from "@/components/Icons"
import type { IconsProps } from "@/interfaces/IconsProps"
import type { IconButtonProps } from '@/interfaces/IconButtonProps'
import { TouchableOpacity, View } from "react-native"
import React from 'react'
import { COLORS } from '@/constants/color'

function IconButton({ action, children, containerClass, wrapperClass, accessibilityLabel, accessibilityHint, accessibilityState }: IconButtonProps) {
  return (
    <TouchableOpacity
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

export function Add({ action, size = 35, accessibilityLabel = 'Adicionar item à lista', accessibilityHint }: IconsProps) {
  return (
    <IconButton
      action={action}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      wrapperClass="absolute bottom-6 right-6 z-50 min-w-14 min-h-14"
      containerClass="bg-lime-400 rounded-full w-14 h-14 items-center justify-center"
    >
      <AddIcon size={size} color={COLORS.black} />
    </IconButton>
  )
}

export function Delete({ action, size, accessibilityLabel = 'Remover item', accessibilityHint, accessibilityState }: IconsProps) {
  return (
    <IconButton action={action} accessibilityLabel={accessibilityLabel} accessibilityHint={accessibilityHint} accessibilityState={accessibilityState}>
      <TrashIcon size={size} />
    </IconButton>
  )
}

export function Edit({ action, size, accessibilityLabel = 'Editar item', accessibilityHint }: IconsProps) {
  return (
    <IconButton action={action} accessibilityLabel={accessibilityLabel} accessibilityHint={accessibilityHint}>
      <EditIcon size={size} />
    </IconButton>
  )
}

export function Share({ action, size, accessibilityLabel = 'Compartilhar lista', accessibilityHint }: IconsProps) {
  return (
    <IconButton action={action} accessibilityLabel={accessibilityLabel} accessibilityHint={accessibilityHint}>
      <ShareIcon size={size} />
    </IconButton>
  )
}

export function Back({ action, size = 35, accessibilityLabel = 'Voltar', accessibilityHint }: IconsProps) {
  return (
    <IconButton action={action} accessibilityLabel={accessibilityLabel} accessibilityHint={accessibilityHint}>
      <BackIcon size={size} />
    </IconButton>
  )
}

export function Notification({ action, checked, size, accessibilityLabel = 'Abrir lembretes', accessibilityHint, accessibilityState }: IconsProps) {
  return (
    <IconButton action={action} accessibilityLabel={accessibilityLabel} accessibilityHint={accessibilityHint} accessibilityState={accessibilityState}>
      <NotificationIcon size={size} checked={checked} />
    </IconButton>
  )
}
