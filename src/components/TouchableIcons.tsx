import { AddIcon, BackIcon, TrashIcon, ShareIcon, NotificationIcon } from "@/components/Icons"
import type { IconProps } from "@/interfaces/IconProps"
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

export function Add({ action }: IconProps) {
  return (
    <IconButton
      action={action}
      wrapperClass="absolute bottom-6 right-6 z-50"
      containerClass="bg-lime-400 rounded-full w-14 h-14 items-center justify-center"
    >
      <AddIcon size={35} color={COLORS.black} />
    </IconButton>
  )
}

export function Delete({ action }: IconProps) {
  return (
    <IconButton action={action}>
      <TrashIcon size={35} />
    </IconButton>
  )
}

export function Share({ action }: IconProps) {
  return (
    <IconButton action={action}>
      <ShareIcon size={35} />
    </IconButton>
  )
}

export function Back({ action }: IconProps) {
  return (
    <IconButton action={action}>
      <BackIcon size={35} />
    </IconButton>
  )
}

export function Notification({ action, checked }: IconProps) {
  return (
    <IconButton action={action}>
      <NotificationIcon size={35} checked={checked} />
    </IconButton>
  )
}
