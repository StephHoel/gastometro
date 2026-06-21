import { AddIcon, BackIcon, TrashIcon, ShareIcon, NotificationIcon, EditIcon } from "@/components/Icons"
import type { IconsProps } from "@/interfaces/IconsProps"
import type { IconButtonProps } from '@/interfaces/IconButtonProps'
import { TouchableOpacity, View } from "react-native"
import React from 'react'
import { COLORS } from '@/constants/color'

function IconButton({ action, children, containerClass, wrapperClass }: IconButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={action}
      className={wrapperClass}
    >
      {containerClass ? (
        <View className={containerClass}>{children}</View>
      ) : (
        children
      )}
    </TouchableOpacity>
  )
}

export function Add({ action, size = 35 }: IconsProps) {
  return (
    <IconButton
      action={action}
      wrapperClass="absolute bottom-6 right-6 z-50"
      containerClass="bg-lime-400 rounded-full w-14 h-14 items-center justify-center"
    >
      <AddIcon size={size} color={COLORS.black} />
    </IconButton>
  )
}

export function Delete({ action, size }: IconsProps) {
  return (
    <IconButton action={action}>
      <TrashIcon size={size} />
    </IconButton>
  )
}

export function Edit({ action, size }: IconsProps) {
  return (
    <IconButton action={action}>
      <EditIcon size={size} />
    </IconButton>
  )
}

export function Share({ action, size }: IconsProps) {
  return (
    <IconButton action={action}>
      <ShareIcon size={size} />
    </IconButton>
  )
}

export function Back({ action, size = 35 }: IconsProps) {
  return (
    <IconButton action={action}>
      <BackIcon size={size} />
    </IconButton>
  )
}

export function Notification({ action, checked, size }: IconsProps) {
  return (
    <IconButton action={action}>
      <NotificationIcon size={size} checked={checked} />
    </IconButton>
  )
}
