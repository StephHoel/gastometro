import { createJSONStorage } from 'zustand/middleware'
import { usePriceComparisonStore } from '@/stores/PriceComparisonStore'

describe('PriceComparisonStore', () => {
  beforeEach(async () => {
    // Aguarda a hidratação automática iniciada na criação da store.
    if (!usePriceComparisonStore.persist.hasHydrated()) {
      await new Promise<void>((resolve) => {
        usePriceComparisonStore.persist.onFinishHydration(() => resolve())
      })
    }

    // Usa armazenamento isolado por teste para impedir interferência de
    // gravações assíncronas ou dados persistidos por outros testes.
    const storage = new Map<string, string>()
    usePriceComparisonStore.persist.setOptions({
      storage: createJSONStorage(() => ({
        getItem: async (name) => storage.get(name) ?? null,
        setItem: async (name, value) => {
          storage.set(name, value)
        },
        removeItem: async (name) => {
          storage.delete(name)
        },
      })),
    })

    await usePriceComparisonStore.persist.rehydrate()
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
