export interface PriceComparisonPlaceProps {
  id: string
  name: string
  note?: string
}

export interface PriceComparisonPriceProps {
  placeId: string
  price: string
}

export interface PriceComparisonEntryProps {
  id: string
  itemName: string
  quantityReference?: string
  pricesByPlace: PriceComparisonPriceProps[]
  createdAt: string
  updatedAt: string
}

export interface PriceComparisonStateProps {
  places: PriceComparisonPlaceProps[]
  entries: PriceComparisonEntryProps[]
  addPlace: (place: Omit<PriceComparisonPlaceProps, 'id'>) => boolean
  updatePlace: (id: string, place: Omit<PriceComparisonPlaceProps, 'id'>) => boolean
  removePlace: (id: string) => void
  addEntry: (entry: Omit<PriceComparisonEntryProps, 'id' | 'createdAt' | 'updatedAt'>) => boolean
  updateEntry: (id: string, entry: Omit<PriceComparisonEntryProps, 'id' | 'createdAt' | 'updatedAt'>) => boolean
  removeEntry: (id: string) => void
}
