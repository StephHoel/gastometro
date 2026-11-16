export interface PriceComparisonEntryProps {
  id: string
  itemName: string
  quantityReference?: string
  pricesByPlace: Array<{ placeId: string; price: string }>
  createdAt: string
  updatedAt: string
}
