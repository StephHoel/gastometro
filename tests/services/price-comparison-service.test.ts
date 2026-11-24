import {
  compareBasket,
  compareEntryPrices,
  parseComparisonPrice,
  validateComparisonEntry,
  validatePlace,
} from '@/services/PriceComparisonService'
import type { PriceComparisonEntryProps, PriceComparisonPlaceProps } from '@/interfaces/PriceComparisonProps'

const places: PriceComparisonPlaceProps[] = [
  { id: 'a', name: 'Mercado A' },
  { id: 'b', name: 'Mercado B' },
  { id: 'c', name: 'Mercado C' },
]

function entry(itemName: string, pricesByPlace: Array<{ placeId: string; price: string }>): PriceComparisonEntryProps {
  return { id: itemName, itemName, pricesByPlace, createdAt: '', updatedAt: '' }
}

describe('PriceComparisonService', () => {
  it('interpreta preços nos formatos pt-BR e decimal', () => {
    expect(parseComparisonPrice('1.234,56')).toBe(1234.56)
    expect(parseComparisonPrice('12,50')).toBe(12.5)
    expect(parseComparisonPrice('12.50')).toBe(12.5)
    expect(Number.isNaN(parseComparisonPrice('-1'))).toBe(true)
  })

  it('valida nomes e preços obrigatórios', () => {
    expect(validatePlace('  ')).not.toBeNull()
    expect(validatePlace('Mercado')).toBeNull()
    expect(validateComparisonEntry('', [{ placeId: 'a', price: '1' }], ['a'])).not.toBeNull()
    expect(validateComparisonEntry('Arroz', [{ placeId: 'a', price: '' }], ['a'])).not.toBeNull()
    expect(validateComparisonEntry('Arroz', [{ placeId: 'a', price: '-1' }], ['a'])).not.toBeNull()
    expect(validateComparisonEntry('Arroz', [{ placeId: 'a', price: '10,50' }], ['a'])).toBeNull()
  })

  it('calcula menor e maior preço e diferença percentual por item', () => {
    const result = compareEntryPrices(entry('Arroz', [
      { placeId: 'a', price: '10,00' },
      { placeId: 'b', price: '8,00' },
      { placeId: 'c', price: '12,00' },
    ]), places)
    expect(result.lowest?.placeId).toBe('b')
    expect(result.highest?.placeId).toBe('c')
    expect(result.difference).toBe(4)
    expect(result.differencePercent).toBeCloseTo(33.333)
  })

  it('ordena lugares por preço individual', () => {
    const result = compareEntryPrices(entry('Feijão', [
      { placeId: 'a', price: '15' },
      { placeId: 'b', price: '9' },
    ]), places)
    expect(result.options.map((option) => option.placeId)).toEqual(['b', 'a'])
  })

  it('não trata preços ausentes como zero no total da cesta', () => {
    const entries = [
      entry('Arroz', [{ placeId: 'a', price: '10' }, { placeId: 'b', price: '12' }]),
      entry('Feijão', [{ placeId: 'a', price: '8' }]),
    ]
    const result = compareBasket(entries, places)
    expect(result.find((place) => place.placeId === 'a')).toMatchObject({ total: 18, complete: true })
    expect(result.find((place) => place.placeId === 'b')).toMatchObject({ total: null, complete: false })
    expect(result.find((place) => place.placeId === 'c')).toMatchObject({ total: null, complete: false })
  })

  it('ordena os totais completos da cesta antes dos incompletos', () => {
    const result = compareBasket([
      entry('Arroz', [{ placeId: 'a', price: '10' }, { placeId: 'b', price: '5' }]),
    ], places)
    expect(result.map((place) => place.placeId)).toEqual(['b', 'a', 'c'])
  })
})
