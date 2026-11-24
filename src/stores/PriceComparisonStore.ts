import AsyncStorage from '@react-native-async-storage/async-storage'
import uuid from 'react-native-uuid'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { PriceComparisonStateProps } from '@/interfaces/PriceComparisonProps'
import { validatePlace } from '@/services/PriceComparisonService'

function normalizeName(value: string): string {
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
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
          places: [...state.places, { ...place, name: place.name.trim(), id: uuid.v4().toString() }],
        }))
        return true
      },
      updatePlace: (id, place) => {
        if (validatePlace(place.name)) return false
        if (get().places.some((current) => current.id !== id && normalizeName(current.name) === normalizeName(place.name))) return false
        set((state) => ({
          places: state.places.map((current) => current.id === id ? { ...current, ...place, name: place.name.trim() } : current),
        }))
        return true
      },
      removePlace: (id) => set((state) => ({
        places: state.places.filter((place) => place.id !== id),
        entries: state.entries.map((entry) => ({
          ...entry,
          pricesByPlace: entry.pricesByPlace.filter((price) => price.placeId !== id),
          updatedAt: new Date().toISOString(),
        })),
      })),
      addEntry: (entry) => {
        if (!entry.itemName.trim() || entry.pricesByPlace.length === 0) return false
        const now = new Date().toISOString()
        set((state) => ({
          entries: [...state.entries, {
            ...entry,
            itemName: entry.itemName.trim(),
            id: uuid.v4().toString(),
            createdAt: now,
            updatedAt: now,
          }],
        }))
        return true
      },
      updateEntry: (id, entry) => {
        if (!entry.itemName.trim() || entry.pricesByPlace.length === 0) return false
        set((state) => ({
          entries: state.entries.map((current) => current.id === id
            ? { ...current, ...entry, itemName: entry.itemName.trim(), updatedAt: new Date().toISOString() }
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
