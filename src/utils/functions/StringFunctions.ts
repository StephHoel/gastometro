import type { ProductProps } from "@/interfaces/ProductProps";
import { SetCurrency } from '@/utils/functions/MathFunctions';

export function FormatTextLine(prod: ProductProps): string {
  return (
    `${prod.quantity}x ${prod.item} | ${SetCurrency(Number.parseFloat(prod.price))}`
  )
}
