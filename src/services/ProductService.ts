import type { ProductProps } from "@/interfaces/ProductProps"
import type { SetProductProps } from "@/interfaces/SetProductProps"
import { ParseToFloat } from '@/utils/functions/MathFunctions'
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
  const floatPrice = ParseToFloat(price)
  const trimmed = price.replace(/\s/g, '')

  if (floatPrice === 0
    && trimmed !== '0'
    && trimmed !== '0.0'
    && trimmed !== '0.00')
    return '0.00'

  return floatPrice.toString()
}

function GetQuantityNormalize(qtt: string) {
  const floatQtt = ParseToFloat(qtt)

  if (floatQtt === 0
    && qtt.replace(/\s/g, '') !== '0')
    return '0'

  return floatQtt.toString()
}

