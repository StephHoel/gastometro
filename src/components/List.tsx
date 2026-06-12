import { CheckboxIcon } from "@/components/Icons"
import { Delete } from "@/components/TouchableIcons"
import type { ListProps } from "@/interfaces/ListProps"
import type { ProductProps } from "@/interfaces/ProductProps"
import { AlertService } from "@/services/AlertService"
import { FormatTextLine } from "@/utils/functions/StringFunctions"
import { useRouter } from "expo-router"
import React from 'react'
import { ScrollView, Text, TouchableOpacity, View } from "react-native"
import { Divider } from '@/components/Divider'
import { TextWhite } from './TextWhite'
import { SortProductsByCollected } from '@/utils/functions/SortList'
import { ListSectionHeader } from './ListSectionHeader'

export function List({ cartStore }: ListProps) {
  const nav = useRouter()
  const { notCollected, collected } = SortProductsByCollected(cartStore.products)

  function toggleCollected(prod: ProductProps): void {
    cartStore.edit({ ...prod, collected: !prod.collected })
  }

  return (
    <ScrollView>
      {notCollected.length > 0 && (
        <ListSectionHeader label="Não coletados" count={notCollected.length} />
      )}

      {notCollected.map((prod: ProductProps, i: number) => (
        <View className="px-4 " key={prod.id}>
          <View className="flex-row gap-2 items-center">
            <Delete
              action={() =>
                AlertService.remove(() => cartStore.remove(prod.id), prod)
              }
            />

            <TouchableOpacity
              className="flex-row items-center space-x-2"
              onPress={() => toggleCollected(prod)}
            >
              <CheckboxIcon checked={prod.collected} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => nav.push(`/list/edit/${prod.id}`)} className="flex-1">
              {prod.collected ? (
                <Text className={`pl-2 mr-14 text-xl line-through text-gray-600`}>{FormatTextLine(prod)}</Text>
              ) : (
                <TextWhite className="pl-2 mr-14 text-xl">{FormatTextLine(prod)}</TextWhite>
              )}
            </TouchableOpacity>
          </View>

          {i !== notCollected.length - 1 && (
            <Divider testID="list-divider" />
          )}
        </View>
      ))}

      {collected.length > 0 && (
        <ListSectionHeader label="Coletados" count={collected.length} />
      )}

      {collected.map((prod: ProductProps, i: number) => (
        <View className="px-4 " key={prod.id}>
          <View className="flex-row gap-2 items-center">
            <Delete
              action={() =>
                AlertService.remove(() => cartStore.remove(prod.id), prod)
              }
            />

            <TouchableOpacity
              className="flex-row items-center space-x-2"
              onPress={() => toggleCollected(prod)}
            >
              <CheckboxIcon checked={prod.collected} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => nav.push(`/list/edit/${prod.id}`)} className="flex-1">
              {prod.collected ? (
                <Text className={`pl-2 mr-14 text-xl line-through text-gray-600`}>{FormatTextLine(prod)}</Text>
              ) : (
                <TextWhite className="pl-2 mr-14 text-xl">{FormatTextLine(prod)}</TextWhite>
              )}
            </TouchableOpacity>
          </View>

          {i !== collected.length - 1 && (
            <Divider testID="list-divider" />
          )}
        </View>
      ))}
    </ScrollView>
  )
}
