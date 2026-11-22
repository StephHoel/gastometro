import uuid from 'react-native-uuid'
import { usePriceComparisonStore } from '@/stores/PriceComparisonStore'

describe('PriceComparisonStore', () => {
  let uuidCounter = 0

  beforeEach(() => {
    uuidCounter = 0
    jest.mocked(uuid.v4).mockImplementation(() => [++uuidCounter])
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
    expect(a.id).not.toBe(b.id)
    usePriceComparisonStore.getState().addEntry({
      itemName: 'Arroz',
      pricesByPlace: [{ placeId: a.id, price: '10' }, { placeId: b.id, price: '12' }],
    })
    usePriceComparisonStore.getState().removePlace(a.id)
    expect(usePriceComparisonStore.getState().places).toEqual([b])
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

  it('rejeita lugares inválidos, duplicados e atualizações com nome já utilizado', () => {
    const store = usePriceComparisonStore.getState()
    expect(store.addPlace({ name: '  ' })).toBe(false)
    store.addPlace({ name: 'Mercado A' })
    store.addPlace({ name: 'Mercado B' })
    const [a, b] = usePriceComparisonStore.getState().places
    expect(usePriceComparisonStore.getState().updatePlace(a.id, { name: 'mercado b' })).toBe(false)
    expect(usePriceComparisonStore.getState().updatePlace('inexistente', { name: 'Novo nome' })).toBe(true)
    expect(usePriceComparisonStore.getState().places).toEqual([a, b])
  })

  it('rejeita itens sem nome ou sem preço e preserva dados ao atualizar identificador inexistente', () => {
    const store = usePriceComparisonStore.getState()
    store.addPlace({ name: 'Mercado A' })
    const place = usePriceComparisonStore.getState().places[0]
    expect(store.addEntry({ itemName: ' ', pricesByPlace: [{ placeId: place.id, price: '1' }] })).toBe(false)
    expect(store.addEntry({ itemName: 'Arroz', pricesByPlace: [] })).toBe(false)
    expect(store.updateEntry('inexistente', { itemName: 'Arroz', pricesByPlace: [{ placeId: place.id, price: '1' }] })).toBe(true)
    expect(usePriceComparisonStore.getState().entries).toHaveLength(0)
  })
})
