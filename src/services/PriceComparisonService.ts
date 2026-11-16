import type {
  PriceComparisonEntryProps,
  PriceComparisonPlaceProps,
} from '@/interfaces/PriceComparisonProps'

export interface PriceOption {
  placeId: string
  placeName: string
  price: number
}

export interface EntryComparison {
  options: PriceOption[]
  lowest: PriceOption | null
  highest: PriceOption | null
  difference: number | null
  differencePercent: number | null
}

export interface BasketPlaceTotal {
  placeId: string
  placeName: string
  total: number | null
  complete: boolean
}

export function parseComparisonPrice(value: string): number {
  const normalized = value.trim().replace(/\s/g, '')
  if (!normalized || normalized.includes('-')) return Number.NaN

  let parsed = normalized
  if (parsed.includes(',') && parsed.includes('.')) {
    parsed = parsed.replace(/\./g, '').replace(',', '.')
  } else if (parsed.includes(',')) {
    parsed = parsed.replace(',', '.')
  }

  const result = Number(parsed)
  return Number.isFinite(result) ? result : Number.NaN
}

export function validatePlace(name: string): string | null {
  return name.trim() ? null : 'Informe o nome do lugar.'
}

export function validateComparisonEntry(
  itemName: string,
  prices: Array<{ placeId: string; price: string }>,
  selectedPlaceIds: string[],
): string | null {
  if (!itemName.trim()) return 'Informe o nome do item.'
  const selectedPrices = prices.filter((price) => selectedPlaceIds.includes(price.placeId))

  for (const selected of selectedPrices) {
    if (!selected.price.trim()) return 'Informe o preço de todos os lugares selecionados.'
    const parsed = parseComparisonPrice(selected.price)
    if (!Number.isFinite(parsed) || parsed < 0) return 'Informe preços válidos e não negativos.'
  }
  if (selectedPrices.length === 0) return 'Informe o preço em pelo menos um lugar.'
  return null
}

export function compareEntryPrices(
  entry: PriceComparisonEntryProps,
  places: PriceComparisonPlaceProps[],
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
    .sort((a, b) => a.price - b.price || a.placeName.localeCompare(b.placeName, 'pt-BR'))

  const lowest = options[0] ?? null
  const highest = options[options.length - 1] ?? null
  const difference = lowest && highest ? highest.price - lowest.price : null
  const differencePercent =
    difference !== null && highest && highest.price > 0
      ? (difference / highest.price) * 100
      : null

  return { options, lowest, highest, difference, differencePercent }
}

export function compareBasket(
  entries: PriceComparisonEntryProps[],
  places: PriceComparisonPlaceProps[],
): BasketPlaceTotal[] {
  return places.map((place) => {
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
    if (!a.complete || a.total === null || b.total === null) return a.placeName.localeCompare(b.placeName, 'pt-BR')
    return a.total - b.total || a.placeName.localeCompare(b.placeName, 'pt-BR')
  })
}
