import type { ProductProps } from "@/interfaces/ProductProps"
import type { SetProductProps } from "@/interfaces/SetProductProps"
import { NormalizeNumericString } from '@/utils/functions/MathFunctions'
import { ToTitleCase } from '@/utils/functions/StringFunctions'

export const ProductService = {
  createOrUpdateProduct(data: SetProductProps): ProductProps {
    return {
      id: data.id,
      item: ToTitleCase(data.item),
      quantity: GetQuantityNormalize(data.qtt),
      price: GetPriceNormalize(data.price),
      collected: data.collected || false,
    }
  }
}

function GetPriceNormalize(price: string) {
  return NormalizeNumericString(price, '0.00', ['0', '0.0', '0.00', '0,0', '0,00'])
}

function GetQuantityNormalize(qtt: string) {
  return NormalizeNumericString(qtt, '0', ['0', '0.0', '0.00', '0,0', '0,00'])
}

