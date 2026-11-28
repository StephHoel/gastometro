import type { DuplicateProductsGroupProps } from '@/interfaces/DuplicateProductsGroupProps'
import type { ProductProps } from '@/interfaces/ProductProps'
import { ParseToFloat } from './MathFunctions'
import { NormalizeItemName } from '@/utils/functions/StringFunctions'
import { NormalizePriceForComparison } from './NumberFunctions'
import type { MergeDuplicateProductsResultProps } from '@/interfaces/MergeDuplicateProductsResultProps'

export const DuplicateProducts = {
  getGroups: (products: ProductProps[]): DuplicateProductsGroupProps[] => {
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
  },

  mergeGroup: (group: DuplicateProductsGroupProps, keepProductId?: string): MergeDuplicateProductsResultProps | undefined => {
    if (group.products.length < 2) return undefined

    const hasDifferentPrice = group.products.some(
      (product) => NormalizePriceForComparison(product.price) !== group.keyPrice,
    )

    if (hasDifferentPrice) return undefined

    const productToKeep = keepProductId
      ? group.products.find((product) => product.id === keepProductId)
      : group.products[0]

    if (!productToKeep) return undefined

    const quantities = group.products.map((product) => ParseToFloat(product.quantity))
    const originalKeepQuantity = ParseToFloat(productToKeep.quantity)
    const rawSum = quantities.reduce((acc, quantity) => acc + quantity, 0)
    const mergedQuantity = parseFloat(rawSum.toFixed(3))
    const hasQuantityChanged = mergedQuantity !== originalKeepQuantity

    const mergedProduct: ProductProps = {
      ...productToKeep,
      quantity: mergedQuantity.toString(),
      collected: hasQuantityChanged ? false : productToKeep.collected,
    }

    const removedIds = group.products
      .filter((product) => product.id !== productToKeep.id)
      .map((product) => product.id)

    return {
      mergedProduct,
      removedIds,
    }
  }
}
