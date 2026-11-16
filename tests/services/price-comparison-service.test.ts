import { PriceComparisonService } from '@/services/PriceComparisonService'
import type { PriceComparisonEntryProps } from '@/interfaces/PriceComparisonEntryProps'
import type { PriceComparisonPlaceProps } from '@/interfaces/PriceComparisonPlaceProps'

const places: PriceComparisonPlaceProps[] = [
  { id: 'market-a', name: 'Mercado A' },
  { id: 'market-b', name: 'Mercado B' },
  { id: 'market-c', name: 'Mercado C' },
]

const entries: PriceComparisonEntryProps[] = [
  { id: 'rice', itemName: 'Arroz', pricesByPlace: [{ placeId: 'market-a', price: '25,00' }, { placeId: 'market-b', price: '22,50' }], createdAt: '', updatedAt: '' },
  { id: 'beans', itemName: 'Feijão', pricesByPlace: [{ placeId: 'market-a', price: '8,00' }, { placeId: 'market-b', price: '9,00' }, { placeId: 'market-c', price: '7,50' }], createdAt: '', updatedAt: '' },
]

describe('PriceComparisonService', () => {
  it('ordena ofertas e identifica menor, maior e diferença percentual por item', () => {
    const result = PriceComparisonService.compareItem(entries[0], places)
    expect(result.offers.map((offer) => offer.price)).toEqual([22.5, 25])
    expect(result.bestPrice).toBe(22.5)
    expect(result.worstPrice).toBe(25)
    expect(result.difference).toBe(2.5)
    expect(result.differencePercent).toBe(10)
    expect(result.bestPlaceIds).toEqual(['market-b'])
  })

  it('ordena lugares por nome quando os preços empatam', () => {
    const entry = { ...entries[0], pricesByPlace: [{ placeId: 'market-b', price: '10,00' }, { placeId: 'market-a', price: '10,00' }] }
    expect(PriceComparisonService.compareItem(entry, places).offers.map((offer) => offer.placeName)).toEqual(['Mercado A', 'Mercado B'])
    expect(PriceComparisonService.compareItem(entry, places).bestPlaceIds).toHaveLength(2)
  })

  it('compara a cesta somente entre lugares com preço de todos os itens', () => {
    const result = PriceComparisonService.compareBasket(entries, places)
    expect(result.totalsByPlace.find((place) => place.placeId === 'market-a')?.total).toBe(33)
    expect(result.totalsByPlace.find((place) => place.placeId === 'market-a')?.unavailableItems).toBe(0)
    expect(result.totalsByPlace.find((place) => place.placeId === 'market-c')?.unavailableItems).toBe(1)
    expect(result.cheapestPlaceIds).toEqual(['market-b'])
  })

  it('não trata preço ausente como zero nem indica vencedor sem cesta completa', () => {
    const result = PriceComparisonService.compareBasket(entries, [places[2]])
    expect(result.totalsByPlace[0].total).toBe(7.5)
    expect(result.totalsByPlace[0].unavailableItems).toBe(1)
    expect(result.cheapestPlaceIds).toEqual([])
  })
})
