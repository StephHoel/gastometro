import { ListItemProps } from '@/interfaces/ListItemProps'
import { FormatTextLine } from '@/utils/functions/StringFunctions'
import React from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import { Divider } from '@/components/Divider'
import { CheckboxIcon } from '@/components/Icons'
import { TextWhite } from '@/components/TextWhite'
import { Delete } from '@/components/TouchableIcons'
import { SIZE } from '@/constants/size'

export function ListItem({ product, index, totalCount, onDelete, onToggle, onEdit }: ListItemProps) {
  return (
    <View className="px-4">
      <View className="flex-row gap-2 items-center">
        <Delete action={onDelete} size={SIZE.iconActions} accessibilityLabel={`Remover ${product.item}`} accessibilityHint="Remove este produto da lista" />

        <TouchableOpacity
          onPress={onToggle}
          className="min-w-11 min-h-11 flex-row items-center justify-center space-x-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-400"
          accessibilityRole="checkbox"
          accessibilityLabel={product.collected ? `Desmarcar ${product.item} como coletado` : `Marcar ${product.item} como coletado`}
          accessibilityHint="Alterna o estado de coleta deste produto"
          accessibilityState={{ checked: product.collected }}
        >
          <CheckboxIcon checked={product.collected} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onEdit} className="flex-1 min-h-11 justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-400" accessibilityRole="button" accessibilityLabel={`Editar ${product.item}`} accessibilityHint="Abre o formulário de edição do produto">
          {product.collected ? (
            <Text className="pl-2 mr-14 text-xl line-through text-slate-300">{FormatTextLine(product)}</Text>
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