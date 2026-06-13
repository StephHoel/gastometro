import type { ProductProps } from "@/interfaces/ProductProps"
import type { SetProductProps } from "@/interfaces/SetProductProps"
import { GetQuantityNormalize, GetPriceNormalize, NormalizePriceForComparison } from '@/utils/functions/NumberFunctions'
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

  isDuplicateItem(item: string, price: string, products: ProductProps[], ignoredId?: string): boolean {
    const normalizedItem = NormalizeItemName(item)
    const normalizedPrice = NormalizePriceForComparison(price)

    return products.some((product) => {
      if (ignoredId && product.id === ignoredId) return false

      return (
        NormalizeItemName(product.item) === normalizedItem
        && NormalizePriceForComparison(product.price) === normalizedPrice
      )
    })
  }
}
