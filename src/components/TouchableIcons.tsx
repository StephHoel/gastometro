import { AddIcon, BackIcon, TrashIcon, ShareIcon } from "@/components/Icons"
import type { IconProps } from "@/interfaces/IconProps"
import { TouchableOpacity, View } from "react-native"
import React from 'react'
import { colors } from '@/constants/color'

function IconButton({ action, children, containerClass, wrapperClass }: {
  action?: () => void
  children: React.ReactNode
  containerClass?: string
  wrapperClass?: string
}) {
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
      <AddIcon size={35} color={colors.black} />
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
