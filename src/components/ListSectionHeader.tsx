import React from 'react'
import { View } from 'react-native'
import { TextWhite } from './TextWhite'
import { ListSectionHeaderProps } from '@/interfaces/ListSectionHeaderProps'

export function ListSectionHeader({ label, count, }: ListSectionHeaderProps) {
  return (
    <View className="px-4 pt-4 pb-2">
      <View className="flex-row items-center justify-between rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-2">
        <TextWhite className="text-sm font-bold uppercase tracking-[1.5px]">
          {label}
        </TextWhite>

        <View className="rounded-full bg-slate-700 px-3 py-1">
          <TextWhite className="text-xs font-bold">
            {count}
          </TextWhite>
        </View>
      </View>
    </View>
  )
}