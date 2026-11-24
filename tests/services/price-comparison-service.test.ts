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
  it('interpreta preços nos formatos pt-BR e decimal e rejeita entradas inválidas', () => {
    expect(parseComparisonPrice('1.234,56')).toBe(1234.56)
    expect(parseComparisonPrice('12,50')).toBe(12.5)
    expect(parseComparisonPrice('12.50')).toBe(12.5)
    expect(Number.isNaN(parseComparisonPrice(''))).toBe(true)
    expect(Number.isNaN(parseComparisonPrice('  '))).toBe(true)
    expect(Number.isNaN(parseComparisonPrice('-1'))).toBe(true)
    expect(Number.isNaN(parseComparisonPrice('abc'))).toBe(true)
    expect(Number.isNaN(parseComparisonPrice('Infinity'))).toBe(true)
  })

  it('valida nomes, seleção de lugares e preços obrigatórios', () => {
    expect(validatePlace('  ')).toBe('Informe o nome do lugar.')
    expect(validatePlace('Mercado')).toBeNull()
    expect(validateComparisonEntry('', [{ placeId: 'a', price: '1' }], ['a'])).toBe('Informe o nome do item.')
    expect(validateComparisonEntry('Arroz', [{ placeId: 'a', price: '' }], ['a'])).toBe('Informe o preço de todos os lugares selecionados.')
    expect(validateComparisonEntry('Arroz', [{ placeId: 'a', price: '-1' }], ['a'])).toBe('Informe preços válidos e não negativos.')
    expect(validateComparisonEntry('Arroz', [{ placeId: 'a', price: 'abc' }], ['a'])).toBe('Informe preços válidos e não negativos.')
    expect(validateComparisonEntry('Arroz', [{ placeId: 'desconhecido', price: '10' }], ['a'])).toBe('Informe o preço em pelo menos um lugar.')
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

  it('trata ofertas iguais, preço zero, lugar removido e valores inválidos', () => {
    const result = compareEntryPrices(entry('Leite', [
      { placeId: 'a', price: '0' },
      { placeId: 'b', price: '0' },
      { placeId: 'c', price: 'inválido' },
      { placeId: 'removido', price: '2' },
    ]), places)
    expect(result.options.map((option) => option.placeId)).toEqual(['a', 'b'])
    expect(result.lowest?.placeId).toBe('a')
    expect(result.highest?.placeId).toBe('a')
    expect(result.difference).toBe(0)
    expect(result.differencePercent).toBeNull()
  })

  it('ordena lugares por preço individual e desempata pelo nome', () => {
    const result = compareEntryPrices(entry('Feijão', [
      { placeId: 'b', price: '9' },
      { placeId: 'a', price: '9' },
    ]), places)
    expect(result.options.map((option) => option.placeId)).toEqual(['a', 'b'])
  })

  it('ordena por nome sem alterar a identificação da melhor e pior oferta', () => {
    const result = compareEntryPrices(entry('Leite', [
      { placeId: 'a', price: '10' },
      { placeId: 'b', price: '5' },
    ]), places, 'name')
    expect(result.options.map((option) => option.placeName)).toEqual(['Mercado A', 'Mercado B'])
    expect(result.lowest?.placeId).toBe('b')
    expect(result.highest?.placeId).toBe('a')
  })

  it('não trata preços ausentes ou inválidos como zero no total da cesta', () => {
    const entries = [
      entry('Arroz', [{ placeId: 'a', price: '10' }, { placeId: 'b', price: '12' }]),
      entry('Feijão', [{ placeId: 'a', price: '8' }, { placeId: 'b', price: '-1' }]),
    ]
    const result = compareBasket(entries, places)
    expect(result.find((place) => place.placeId === 'a')).toMatchObject({ total: 18, complete: true })
    expect(result.find((place) => place.placeId === 'b')).toMatchObject({ total: null, complete: false })
    expect(result.find((place) => place.placeId === 'c')).toMatchObject({ total: null, complete: false })
  })

  it('ordena os totais completos antes dos incompletos e por nome quando solicitado', () => {
    const entries = [entry('Arroz', [
      { placeId: 'a', price: '10' },
      { placeId: 'b', price: '5' },
      { placeId: 'c', price: '5' },
    ])]
    expect(compareBasket(entries, places).map((place) => place.placeId)).toEqual(['b', 'c', 'a'])
    expect(compareBasket(entries, places, 'name').map((place) => place.placeId)).toEqual(['a', 'b', 'c'])
  })

  it('considera a cesta vazia incompleta e mantém ordenação alfabética', () => {
    expect(compareBasket([], places).every((place) => !place.complete && place.total === 0)).toBe(true)
    expect(compareBasket([], [...places].reverse(), 'name').map((place) => place.placeId)).toEqual(['a', 'b', 'c'])
  })
})
