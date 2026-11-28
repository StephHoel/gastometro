import AsyncStorage from '@react-native-async-storage/async-storage'
import uuid from 'react-native-uuid'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type {
  PriceComparisonEntryProps,
  PriceComparisonStateProps,
} from '@/interfaces/PriceComparisonProps'
import { parseComparisonPrice, validatePlace } from '@/services/PriceComparisonService'

function normalizeName(value: string): string {
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
}

function isValidEntry(
  entry: Omit<PriceComparisonEntryProps, 'id' | 'createdAt' | 'updatedAt'>,
  placeIds: Set<string>,
): boolean {
  if (!entry.itemName.trim()) return false

  const seenPlaceIds = new Set<string>()

  return entry.pricesByPlace.every(({ placeId, price }) => {
    if (!placeIds.has(placeId) || seenPlaceIds.has(placeId) || !price.trim()) return false

    seenPlaceIds.add(placeId)

    const parsed = parseComparisonPrice(price)

    return Number.isFinite(parsed) && parsed >= 0
  })
}

export const usePriceComparisonStore = create(
  persist<PriceComparisonStateProps>(
    (set, get) => ({
      places: [],
      entries: [],
      addPlace: (place) => {
        if (validatePlace(place.name)) return false
        if (get().places.some((current) => normalizeName(current.name) === normalizeName(place.name))) return false
        set((state) => ({
          places: [...state.places, {
            ...place,
            name: place.name.trim(),
            note: place.note?.trim() || undefined,
            id: uuid.v4().toString(),
          }],
        }))
        return true
      },
      updatePlace: (id, place) => {
        if (!get().places.some((current) => current.id === id) || validatePlace(place.name)) return false
        if (get().places.some((current) => current.id !== id && normalizeName(current.name) === normalizeName(place.name))) return false
        set((state) => ({
          places: state.places.map((current) => current.id === id
            ? { ...current, ...place, name: place.name.trim(), note: place.note?.trim() || undefined }
            : current),
        }))
        return true
      },
      removePlace: (id) => set((state) => ({
        places: state.places.filter((place) => place.id !== id),
        entries: state.entries.map((entry) => {
          const pricesByPlace = entry.pricesByPlace.filter((price) => price.placeId !== id)
          return pricesByPlace.length === entry.pricesByPlace.length
            ? entry
            : { ...entry, pricesByPlace, updatedAt: new Date().toISOString() }
        }),
      })),
      addEntry: (entry) => {
        if (!isValidEntry(entry, new Set(get().places.map((place) => place.id)))) return false
        const now = new Date().toISOString()
        set((state) => ({
          entries: [...state.entries, {
            ...entry,
            itemName: entry.itemName.trim(),
            quantityReference: entry.quantityReference?.trim() || undefined,
            pricesByPlace: entry.pricesByPlace.map((price) => ({ ...price, price: price.price.trim() })),
            id: uuid.v4().toString(),
            createdAt: now,
            updatedAt: now,
          }],
        }))
        return true
      },
      updateEntry: (id, entry) => {
        if (!get().entries.some((current) => current.id === id)) return false
        if (!isValidEntry(entry, new Set(get().places.map((place) => place.id)))) return false
        set((state) => ({
          entries: state.entries.map((current) => current.id === id
            ? {
              ...current,
              ...entry,
              itemName: entry.itemName.trim(),
              quantityReference: entry.quantityReference?.trim() || undefined,
              pricesByPlace: entry.pricesByPlace.map((price) => ({ ...price, price: price.price.trim() })),
              updatedAt: new Date().toISOString(),
            }
            : current),
        }))
        return true
      },
      removeEntry: (id) => set((state) => ({
        entries: state.entries.filter((entry) => entry.id !== id),
      })),
    }),
    {
      name: 'gastometro-price-comparisons',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
)
