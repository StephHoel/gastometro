import type { PriceComparisonEntryProps } from '@/interfaces/PriceComparisonEntryProps'
import type { PriceComparisonPlaceProps } from '@/interfaces/PriceComparisonPlaceProps'
import { ParseToFloat, SetCurrency } from '@/utils/functions/MathFunctions'

export interface PriceOffer {
  placeId: string
  placeName: string
  price: number
  formattedPrice: string
}

export interface PriceComparisonResult {
  itemName: string
  offers: PriceOffer[]
  bestPrice: number | null
  worstPrice: number | null
  difference: number
  differencePercent: number | null
  bestPlaceIds: string[]
}

export interface BasketComparisonResult {
  totalsByPlace: Array<{ placeId: string; placeName: string; total: number; formattedTotal: string; comparedItems: number; unavailableItems: number }>
  cheapestPlaceIds: string[]
}

export const PriceComparisonService = {
  compareItem(entry: PriceComparisonEntryProps, places: PriceComparisonPlaceProps[]): PriceComparisonResult {
    const placeMap = new Map(places.map((place) => [place.id, place]))
    const offers = entry.pricesByPlace.flatMap((price) => {
      const place = placeMap.get(price.placeId)
      const value = ParseToFloat(price.price)
      return place && price.price.trim() !== '' && value >= 0
        ? [{ placeId: place.id, placeName: place.name, price: value, formattedPrice: SetCurrency(value) }]
        : []
    }).sort((a, b) => a.price - b.price || a.placeName.localeCompare(b.placeName, 'pt-BR'))
    const bestPrice = offers.length ? offers[0].price : null
    const worstPrice = offers.length ? offers[offers.length - 1].price : null
    const difference = bestPrice === null || worstPrice === null ? 0 : worstPrice - bestPrice
    return {
      itemName: entry.itemName,
      offers,
      bestPrice,
      worstPrice,
      difference,
      differencePercent: worstPrice === null || worstPrice === 0 ? null : difference / worstPrice * 100,
      bestPlaceIds: bestPrice === null ? [] : offers.filter((offer) => offer.price === bestPrice).map((offer) => offer.placeId),
    }
  },

  compareBasket(entries: PriceComparisonEntryProps[], places: PriceComparisonPlaceProps[]): BasketComparisonResult {
    const totals = places.map((place) => {
      let total = 0
      let comparedItems = 0
      let unavailableItems = 0
      for (const entry of entries) {
        const offer = entry.pricesByPlace.find((price) => price.placeId === place.id && price.price.trim() !== '')
        if (!offer) { unavailableItems += 1; continue }
        total += ParseToFloat(offer.price)
        comparedItems += 1
      }
      return { placeId: place.id, placeName: place.name, total, formattedTotal: SetCurrency(total), comparedItems, unavailableItems }
    })
    const completeBaskets = totals.filter((total) => total.unavailableItems === 0 && entries.length > 0)
    const minimum = completeBaskets.length ? Math.min(...completeBaskets.map((total) => total.total)) : null
    return {
      totalsByPlace: totals.sort((a, b) => a.total - b.total || a.placeName.localeCompare(b.placeName, 'pt-BR')),
      cheapestPlaceIds: minimum === null ? [] : completeBaskets.filter((total) => total.total === minimum).map((total) => total.placeId),
    }
  },
}
