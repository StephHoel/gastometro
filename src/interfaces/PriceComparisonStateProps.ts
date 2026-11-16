import type { PriceComparisonEntryProps } from '@/interfaces/PriceComparisonEntryProps'
import type { PriceComparisonPlaceProps } from '@/interfaces/PriceComparisonPlaceProps'

export interface PriceComparisonStateProps {
  places: PriceComparisonPlaceProps[]
  entries: PriceComparisonEntryProps[]
  addPlace: (name: string, note?: string) => string | null
  updatePlace: (id: string, name: string, note?: string) => boolean
  removePlace: (id: string) => void
  addEntry: (itemName: string, pricesByPlace: Array<{ placeId: string; price: string }>, quantityReference?: string) => string | null
  updateEntry: (id: string, itemName: string, pricesByPlace: Array<{ placeId: string; price: string }>, quantityReference?: string) => boolean
  removeEntry: (id: string) => void
}
