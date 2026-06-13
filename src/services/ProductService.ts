import type { ProductProps } from "@/interfaces/ProductProps"
import type { SetProductProps } from "@/interfaces/SetProductProps"
import { GetQuantityNormalize, GetPriceNormalize } from '@/utils/functions/NumberFunctions'
import { NormalizeItemName, ToTitleCase } from '@/utils/functions/StringFunctions'

export const ProductService = {
  createOrUpdateProduct(data: SetProductProps): ProductProps {
    return {
      id: data.id,
      item: ToTitleCase(data.item),
      quantity: GetQuantityNormalize(data.qtt),
      price: GetPriceNormalize(data.price),
      collected: data.collected || false,
    }
  },

  isDuplicateItem(item: string, products: ProductProps[], ignoredId?: string): boolean {
    const normalizedItem = NormalizeItemName(item)

    return products.some((product) => {
      if (ignoredId && product.id === ignoredId) return false

      return NormalizeItemName(product.item) === normalizedItem
    })
  }
}
