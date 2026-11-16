import { usePriceComparisonStore } from '@/stores/PriceComparisonStore'

describe('PriceComparisonStore', () => {
  beforeEach(() => {
    usePriceComparisonStore.setState({ places: [], entries: [] })
  })

  it('cria e atualiza lugares e bloqueia nomes duplicados ignorando acentos e caixa', () => {
    const store = usePriceComparisonStore.getState()
    expect(store.addPlace({ name: 'Mercado São João' })).toBe(true)
    expect(usePriceComparisonStore.getState().addPlace({ name: 'mercado sao joao' })).toBe(false)
    const place = usePriceComparisonStore.getState().places[0]
    expect(usePriceComparisonStore.getState().updatePlace(place.id, { name: 'Atacado Central' })).toBe(true)
    expect(usePriceComparisonStore.getState().places[0].name).toBe('Atacado Central')
  })

  it('remove lugar e elimina seus preços das comparações', () => {
    const store = usePriceComparisonStore.getState()
    store.addPlace({ name: 'Mercado A' })
    store.addPlace({ name: 'Mercado B' })
    const [a, b] = usePriceComparisonStore.getState().places
    usePriceComparisonStore.getState().addEntry({
      itemName: 'Arroz',
      pricesByPlace: [{ placeId: a.id, price: '10' }, { placeId: b.id, price: '12' }],
    })
    usePriceComparisonStore.getState().removePlace(a.id)
    expect(usePriceComparisonStore.getState().places).toHaveLength(1)
    expect(usePriceComparisonStore.getState().entries[0].pricesByPlace).toEqual([{ placeId: b.id, price: '12' }])
  })

  it('cria, edita e remove itens comparados', () => {
    const store = usePriceComparisonStore.getState()
    store.addPlace({ name: 'Mercado A' })
    const place = usePriceComparisonStore.getState().places[0]
    expect(usePriceComparisonStore.getState().addEntry({ itemName: 'Arroz', pricesByPlace: [{ placeId: place.id, price: '10' }] })).toBe(true)
    const entry = usePriceComparisonStore.getState().entries[0]
    expect(usePriceComparisonStore.getState().updateEntry(entry.id, { itemName: 'Arroz integral', pricesByPlace: [{ placeId: place.id, price: '11' }] })).toBe(true)
    expect(usePriceComparisonStore.getState().entries[0].itemName).toBe('Arroz integral')
    usePriceComparisonStore.getState().removeEntry(entry.id)
    expect(usePriceComparisonStore.getState().entries).toHaveLength(0)
  })
})
