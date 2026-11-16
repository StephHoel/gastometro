import { usePriceComparisonStore } from '@/stores/PriceComparisonStore'

describe('PriceComparisonStore', () => {
  beforeEach(() => {
    usePriceComparisonStore.setState({ places: [], entries: [] })
  })

  it('cadastra lugares e impede nomes duplicados ignorando caixa e espaços externos', () => {
    const store = usePriceComparisonStore.getState()
    expect(store.addPlace(' Mercado Central ')).toBeTruthy()
    expect(usePriceComparisonStore.getState().addPlace('mercado central')).toBeNull()
    expect(usePriceComparisonStore.getState().places).toHaveLength(1)
  })

  it('impede lugar e item vazios e preços negativos ou inválidos', () => {
    const store = usePriceComparisonStore.getState()
    expect(store.addPlace('   ')).toBeNull()
    const placeId = store.addPlace('Mercado')
    expect(placeId).toBeTruthy()
    expect(usePriceComparisonStore.getState().addEntry('Arroz', [{ placeId: placeId!, price: '-1' }])).toBeNull()
    expect(usePriceComparisonStore.getState().addEntry('Arroz', [{ placeId: placeId!, price: 'abc' }])).toBeNull()
    expect(usePriceComparisonStore.getState().addEntry(' ', [{ placeId: placeId!, price: '2,50' }])).toBeNull()
  })

  it('remove ofertas do lugar excluído sem remover o item comparado', () => {
    const store = usePriceComparisonStore.getState()
    const first = store.addPlace('Mercado A')!
    const second = store.addPlace('Mercado B')!
    store.addEntry('Leite', [{ placeId: first, price: '5,00' }, { placeId: second, price: '4,50' }])
    usePriceComparisonStore.getState().removePlace(first)
    const state = usePriceComparisonStore.getState()
    expect(state.places.map((place) => place.id)).toEqual([second])
    expect(state.entries).toHaveLength(1)
    expect(state.entries[0].pricesByPlace).toEqual([{ placeId: second, price: '4,50' }])
  })

  it('atualiza nome e preços de uma comparação', () => {
    const store = usePriceComparisonStore.getState()
    const placeId = store.addPlace('Mercado')!
    const entryId = store.addEntry('Café', [{ placeId, price: '12,00' }])!
    expect(usePriceComparisonStore.getState().updateEntry(entryId, 'Café em pó', [{ placeId, price: '13,50' }])).toBe(true)
    expect(usePriceComparisonStore.getState().entries[0].itemName).toBe('Café em pó')
  })
})
