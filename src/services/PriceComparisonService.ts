import { ERROR } from '@/constants/text/error'
import { BasketPlaceTotal } from '@/interfaces/BasketPlaceTotal'
import { EntryComparison } from '@/interfaces/EntryComparison'
import type {
  PriceComparisonEntryProps,
  PriceComparisonPlaceProps,
} from '@/interfaces/PriceComparisonProps'
import { PriceOption } from '@/interfaces/PriceOption'

/**
 * Interpreta valores monetários em pt-BR (1.234,56) e decimal (1234.56).
 * Um preço ausente ou inválido retorna NaN para nunca ser confundido com zero.
 */
export function parseComparisonPrice(value: string): number {
  let normalized = value.trim().replace(/^R\$\s*/i, '').replace(/\s/g, '')
  if (!normalized || normalized.includes('-')) return Number.NaN

  if (normalized.includes(',') && normalized.includes('.')) {
    // No formato pt-BR, o ponto separa milhares e a vírgula separa centavos.
    if (!/^\d{1,3}(\.\d{3})*,\d{1,2}$/.test(normalized)) return Number.NaN
    normalized = normalized.replace(/\./g, '').replace(',', '.')
  } else if (normalized.includes(',')) {
    if (!/^\d+,\d{1,2}$/.test(normalized)) return Number.NaN
    normalized = normalized.replace(',', '.')
  } else if (normalized.includes('.')) {
    // Aceita decimal com ponto e agrupamento de milhares sem casas decimais.
    if (/^\d{1,3}(\.\d{3})+$/.test(normalized)) {
      normalized = normalized.replace(/\./g, '')
    } else if (!/^\d+\.\d{1,2}$/.test(normalized)) {
      return Number.NaN
    }
  } else if (!/^\d+$/.test(normalized)) {
    return Number.NaN
  }

  const result = Number(normalized)
  return Number.isFinite(result) ? result : Number.NaN
}

export function validatePlace(name: string): string | null {
  return name.trim() ? null : ERROR.place_name_required
}

/**
 * Permite deixar um lugar sem preço para representar uma cesta incompleta.
 * Todo preço informado, porém, precisa pertencer a um lugar cadastrado e ser válido.
 */
export function validateComparisonEntry(
  itemName: string,
  prices: Array<{ placeId: string; price: string }>,
  selectedPlaceIds: string[],
): string | null {
  if (!itemName.trim()) return ERROR.item_name_required

  const validPlaceIds = new Set(selectedPlaceIds)
  const seenPlaceIds = new Set<string>()

  for (const price of prices) {
    if (!validPlaceIds.has(price.placeId) || seenPlaceIds.has(price.placeId)) {
      return ERROR.invalid_place
    }

    seenPlaceIds.add(price.placeId)

    if (!price.price.trim()) return ERROR.price_invalid

    const parsed = parseComparisonPrice(price.price)

    if (!Number.isFinite(parsed) || parsed < 0) return ERROR.price_negative
  }

  return null
}

export function compareEntryPrices(
  entry: PriceComparisonEntryProps,
  places: PriceComparisonPlaceProps[],
  sortBy: 'price' | 'name' = 'price',
): EntryComparison {
  const options = entry.pricesByPlace
    .map((item) => {
      const place = places.find((candidate) => candidate.id === item.placeId)
      const price = parseComparisonPrice(item.price)
      return place && Number.isFinite(price) && price >= 0
        ? { placeId: place.id, placeName: place.name, price }
        : null
    })
    .filter((option): option is PriceOption => option !== null)
    .sort((a, b) => sortBy === 'name'
      ? a.placeName.localeCompare(b.placeName, 'pt-BR')
      : a.price - b.price || a.placeName.localeCompare(b.placeName, 'pt-BR'))

  const lowest = options.reduce<PriceOption | null>(
    (current, option) => !current || option.price < current.price ? option : current,
    null,
  )
  const highest = options.reduce<PriceOption | null>(
    (current, option) => !current || option.price > current.price ? option : current,
    null,
  )
  const difference = options.length >= 2 && lowest && highest ? highest.price - lowest.price : null
  const differencePercent = difference !== null && highest && highest.price > 0
    ? (difference / highest.price) * 100
    : null

  return { options, lowest, highest, difference, differencePercent }
}

export function compareBasket(
  entries: PriceComparisonEntryProps[],
  places: PriceComparisonPlaceProps[],
  sortBy: 'price' | 'name' = 'price',
): BasketPlaceTotal[] {
  return places.map((place) => {
    if (entries.length === 0) {
      return { placeId: place.id, placeName: place.name, total: null, complete: false }
    }

    let total = 0
    for (const entry of entries) {
      const price = entry.pricesByPlace.find((item) => item.placeId === place.id)
      const parsed = price ? parseComparisonPrice(price.price) : Number.NaN
      if (!Number.isFinite(parsed) || parsed < 0) {
        return { placeId: place.id, placeName: place.name, total: null, complete: false }
      }
      total += parsed
    }
    return { placeId: place.id, placeName: place.name, total, complete: entries.length > 0 }
  }).sort((a, b) => {
    if (a.complete !== b.complete) return a.complete ? -1 : 1
    if (sortBy === 'name' || !a.complete || a.total === null || b.total === null) {
      return a.placeName.localeCompare(b.placeName, 'pt-BR')
    }
    return a.total - b.total || a.placeName.localeCompare(b.placeName, 'pt-BR')
  })
}
