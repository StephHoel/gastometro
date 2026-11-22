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

  it('remove lugar e elimina apenas os preços associados', () => {
    const store = usePriceComparisonStore.getState()
    store.addPlace({ name: 'Mercado A' })
    store.addPlace({ name: 'Mercado B' })
    const [a, b] = usePriceComparisonStore.getState().places
    store.addEntry({
      itemName: 'Arroz',
      pricesByPlace: [{ placeId: a.id, price: '10' }, { placeId: b.id, price: '12' }],
    })
    const beforeRemoval = usePriceComparisonStore.getState().entries[0].updatedAt

    usePriceComparisonStore.getState().removePlace(a.id)

    expect(usePriceComparisonStore.getState().places).toEqual([b])
    expect(usePriceComparisonStore.getState().entries[0].pricesByPlace).toEqual([{ placeId: b.id, price: '12' }])
    expect(usePriceComparisonStore.getState().entries[0].updatedAt).not.toBe(beforeRemoval)
  })

  it('cria, edita e remove itens comparados', () => {
    const store = usePriceComparisonStore.getState()
    store.addPlace({ name: 'Mercado A' })
    const place = usePriceComparisonStore.getState().places[0]
    expect(store.addEntry({ itemName: 'Arroz', pricesByPlace: [{ placeId: place.id, price: '10' }] })).toBe(true)
    const entry = usePriceComparisonStore.getState().entries[0]
    expect(usePriceComparisonStore.getState().updateEntry(entry.id, {
      itemName: 'Arroz integral',
      pricesByPlace: [{ placeId: place.id, price: '11' }],
    })).toBe(true)
    expect(usePriceComparisonStore.getState().entries[0].itemName).toBe('Arroz integral')
    usePriceComparisonStore.getState().removeEntry(entry.id)
    expect(usePriceComparisonStore.getState().entries).toHaveLength(0)
  })

  it('rejeita lugares inválidos, duplicados e atualizações com nome ou ID já utilizado', () => {
    const store = usePriceComparisonStore.getState()
    expect(store.addPlace({ name: '  ' })).toBe(false)
    store.addPlace({ name: 'Mercado A' })
    store.addPlace({ name: 'Mercado B' })
    const [a, b] = usePriceComparisonStore.getState().places
    expect(store.updatePlace(a.id, { name: 'mercado b' })).toBe(false)
    expect(store.updatePlace('inexistente', { name: 'Novo nome' })).toBe(false)
    expect(usePriceComparisonStore.getState().places).toEqual([a, b])
  })

  it('rejeita itens sem nome, sem preço, inválidos ou ligados a lugares inexistentes', () => {
    const store = usePriceComparisonStore.getState()
    store.addPlace({ name: 'Mercado A' })
    const place = usePriceComparisonStore.getState().places[0]

    expect(store.addEntry({ itemName: ' ', pricesByPlace: [{ placeId: place.id, price: '1' }] })).toBe(false)
    expect(store.addEntry({ itemName: 'Arroz', pricesByPlace: [] })).toBe(false)
    expect(store.addEntry({ itemName: 'Arroz', pricesByPlace: [{ placeId: 'inexistente', price: '1' }] })).toBe(false)
    expect(store.addEntry({ itemName: 'Arroz', pricesByPlace: [{ placeId: place.id, price: '-1' }] })).toBe(false)
    expect(store.addEntry({ itemName: 'Arroz', pricesByPlace: [{ placeId: place.id, price: 'inválido' }] })).toBe(false)
    expect(store.addEntry({ itemName: 'Arroz', pricesByPlace: [{ placeId: place.id, price: '' }] })).toBe(false)
    expect(store.addEntry({ itemName: 'Arroz', pricesByPlace: [
      { placeId: place.id, price: '1' },
      { placeId: place.id, price: '2' },
    ] })).toBe(false)
    expect(store.updateEntry('inexistente', {
      itemName: 'Arroz',
      pricesByPlace: [{ placeId: place.id, price: '1' }],
    })).toBe(false)
    expect(usePriceComparisonStore.getState().entries).toHaveLength(0)
  })

  it('normaliza dados válidos e preserva o registro quando uma edição é inválida', () => {
    const store = usePriceComparisonStore.getState()
    store.addPlace({ name: 'Mercado A', note: '  unidade central  ' })
    const place = usePriceComparisonStore.getState().places[0]
    expect(place.note).toBe('unidade central')
    expect(store.addEntry({
      itemName: '  Arroz  ',
      quantityReference: '  1 kg  ',
      pricesByPlace: [{ placeId: place.id, price: ' 10,50 ' }],
    })).toBe(true)
    const created = usePriceComparisonStore.getState().entries[0]
    expect(created).toMatchObject({
      itemName: 'Arroz',
      quantityReference: '1 kg',
      pricesByPlace: [{ placeId: place.id, price: '10,50' }],
    })
    expect(store.updateEntry(created.id, {
      itemName: 'Arroz integral',
      pricesByPlace: [{ placeId: 'unknown', price: '12' }],
    })).toBe(false)
    expect(usePriceComparisonStore.getState().entries[0]).toEqual(created)
  })
})
