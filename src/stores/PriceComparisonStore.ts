import AsyncStorage from '@react-native-async-storage/async-storage'
import uuid from 'react-native-uuid'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { PriceComparisonStateProps } from '@/interfaces/PriceComparisonStateProps'
import type { PriceComparisonEntryProps } from '@/interfaces/PriceComparisonEntryProps'

function validPrices(prices: Array<{ placeId: string; price: string }>, placeIds: Set<string>) {
  return prices.length > 0 &&
    prices.every((entry) => placeIds.has(entry.placeId) && entry.price.trim() !== '' &&
      Number.isFinite(Number(entry.price.replace(',', '.'))) &&
      Number(entry.price.replace(',', '.')) >= 0)
}

export const usePriceComparisonStore = create<PriceComparisonStateProps>()(
  persist(
    (set, get) => ({
      places: [],
      entries: [],
      addPlace: (name, note) => {
        const normalized = name.trim().toLocaleLowerCase('pt-BR')
        if (!normalized || get().places.some((place) => place.name.trim().toLocaleLowerCase('pt-BR') === normalized)) return null
        const id = uuid.v4().toString()
        set((state) => ({ places: [...state.places, { id, name: name.trim(), note: note?.trim() || undefined }] }))
        return id
      },
      updatePlace: (id, name, note) => {
        const normalized = name.trim().toLocaleLowerCase('pt-BR')
        if (!normalized || get().places.some((place) => place.id !== id && place.name.trim().toLocaleLowerCase('pt-BR') === normalized)) return false
        set((state) => ({ places: state.places.map((place) => place.id === id ? { ...place, name: name.trim(), note: note?.trim() || undefined } : place) }))
        return true
      },
      removePlace: (id) => set((state) => ({
        places: state.places.filter((place) => place.id !== id),
        entries: state.entries.map((entry) => ({ ...entry, pricesByPlace: entry.pricesByPlace.filter((price) => price.placeId !== id) })),
      })),
      addEntry: (itemName, pricesByPlace, quantityReference) => {
        const places = new Set(get().places.map((place) => place.id))
        if (!itemName.trim() || !validPrices(pricesByPlace, places)) return null
        const timestamp = new Date().toISOString()
        const entry: PriceComparisonEntryProps = { id: uuid.v4().toString(), itemName: itemName.trim(), quantityReference: quantityReference?.trim() || undefined, pricesByPlace, createdAt: timestamp, updatedAt: timestamp }
        set((state) => ({ entries: [...state.entries, entry] }))
        return entry.id
      },
      updateEntry: (id, itemName, pricesByPlace, quantityReference) => {
        const places = new Set(get().places.map((place) => place.id))
        if (!itemName.trim() || !validPrices(pricesByPlace, places)) return false
        set((state) => ({ entries: state.entries.map((entry) => entry.id === id ? { ...entry, itemName: itemName.trim(), quantityReference: quantityReference?.trim() || undefined, pricesByPlace, updatedAt: new Date().toISOString() } : entry) }))
        return true
      },
      removeEntry: (id) => set((state) => ({ entries: state.entries.filter((entry) => entry.id !== id) })),
    }),
    { name: 'gastometro-price-comparisons', storage: createJSONStorage(() => AsyncStorage), version: 1 },
  ),
)
