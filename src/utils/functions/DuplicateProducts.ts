import type { DuplicateProductsGroupProps } from '@/interfaces/DuplicateProductsGroupProps'
import type { ProductProps } from '@/interfaces/ProductProps'
import { NormalizeItemName } from '@/utils/functions/StringFunctions'
import { NormalizePriceForComparison } from './NumberFunctions'

export function GetDuplicateProductsGroups(products: ProductProps[]): DuplicateProductsGroupProps[] {
  const groupsMap = new Map<string, DuplicateProductsGroupProps>()

  products.forEach((product) => {
    const keyItem = NormalizeItemName(product.item)
    const keyPrice = NormalizePriceForComparison(product.price)
    const key = `${keyItem}||${keyPrice}`
    const current = groupsMap.get(key)

    if (current) {
      current.products.push(product)
      return
    }

    groupsMap.set(key, {
      keyItem,
      keyPrice,
      products: [product],
    })
  })

  return Array.from(groupsMap.values())
    .filter((group) => group.products.length > 1)
}
