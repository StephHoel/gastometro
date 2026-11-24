import { PriceComparisonPriceProps } from '../PriceComparisonProps'

export interface CartFormData {
  itemName: string
  quantityReference?: string
  pricesByPlace: PriceComparisonPriceProps[]
}
