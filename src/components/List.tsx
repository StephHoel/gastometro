import type { ListProps } from "@/interfaces/ListProps"
import type { ProductProps } from "@/interfaces/ProductProps"
import { AlertService } from "@/services/AlertService"
import { useRouter } from "expo-router"
import React from 'react'
import { ScrollView } from "react-native"
import { SortProductsByCollected } from '@/utils/functions/SortList'
import { ListSectionHeader } from './ListSectionHeader'
import { ListItem } from './List/ListItem'

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
        <ListItem
          key={prod.id}
          product={prod}
          index={i}
          totalCount={notCollected.length}
          onDelete={() => AlertService.remove(() => cartStore.remove(prod.id), prod)}
          onToggle={() => toggleCollected(prod)}
          onEdit={() => nav.push(`/list/edit/${prod.id}`)}
        />
      ))}

      {collected.length > 0 && (
        <ListSectionHeader label="Coletados" count={collected.length} />
      )}

      {collected.map((prod: ProductProps, i: number) => (
        <ListItem
          key={prod.id}
          product={prod}
          index={i}
          totalCount={collected.length}
          onDelete={() => AlertService.remove(() => cartStore.remove(prod.id), prod)}
          onToggle={() => toggleCollected(prod)}
          onEdit={() => nav.push(`/list/edit/${prod.id}`)}
        />
      ))}
    </ScrollView>
  )
}
