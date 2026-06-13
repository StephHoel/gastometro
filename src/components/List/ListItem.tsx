import { ListItemProps } from '@/interfaces/ListItemProps'
import { FormatTextLine } from '@/utils/functions/StringFunctions'
import React from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import { Divider } from '../Divider'
import { CheckboxIcon } from '../Icons'
import { TextWhite } from '../TextWhite'
import { Delete } from '../TouchableIcons'

export function ListItem({ product, index, totalCount, onDelete, onToggle, onEdit }: ListItemProps) {
  return (
    <View className="px-4">
      <View className="flex-row gap-2 items-center">
        <Delete action={onDelete} />

        <TouchableOpacity
          onPress={onToggle}
          className="flex-row items-center space-x-2"
          accessibilityState={{ checked: product.collected }}
        >
          <CheckboxIcon checked={product.collected} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onEdit} className="flex-1">
          {product.collected ? (
            <Text className="pl-2 mr-14 text-xl line-through text-gray-600">{FormatTextLine(product)}</Text>
          ) : (
            <TextWhite className="pl-2 mr-14 text-xl">{FormatTextLine(product)}</TextWhite>
          )}
        </TouchableOpacity>
      </View>

      {index !== totalCount - 1 && (
        <Divider testID="list-divider" />
      )}
    </View>
  )
}