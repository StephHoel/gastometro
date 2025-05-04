import type { ProductProps } from "@/interfaces/ProductProps";
import type { SetProductProps } from "@/interfaces/SetProductProps";

export const ProductService = {
  createOrUpdateProduct(data: SetProductProps): ProductProps {
    return {
      id: data.id,
      item: GetItemNomalize(data.item),
      quantity: GetQuantityNormalize(data.qtt),
      price: GetPriceNormalize(data.price),
      collected: data.collected || false,
    }
  }
}

function GetItemNomalize(item: string) {
  return item
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function GetPriceNormalize(price: string) {
  const floatPrice = Number.parseFloat(price.replace(',', '.').trim())
  return Number.isNaN(floatPrice) ? '0.00' : floatPrice.toString()
}

function GetQuantityNormalize(qtt: string) {
  const floatQtt = Number.parseFloat(qtt.replace(',', '.').trim())
  return Number.isNaN(floatQtt) ? '0' : floatQtt.toString()
}

