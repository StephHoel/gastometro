import { useCartStore } from '@/stores/CartStore'
import type { ProductProps } from '@/interfaces/ProductProps'

describe('useCartStore - Multiple Lists', () => {
  beforeEach(() => {
    useCartStore.setState({
      lists: [{ id: 'list-1', name: 'Lista 1', products: [] }],
      activeListId: 'list-1',
      products: [],
    })
  })

  it('deve iniciar com uma lista padrão', () => {
    const store = useCartStore.getState()
    expect(store.lists).toHaveLength(1)
    expect(store.activeListId).toBe(store.lists[0].id)
  })

  it('deve criar nova lista', () => {
    const store = useCartStore.getState()
    store.addList('Nova Lista')

    const state = useCartStore.getState()
    expect(state.lists).toHaveLength(2)
    expect(state.lists[1].name).toBe('Nova Lista')
    expect(state.activeListId).toBe(state.lists[1].id)
  })

  it('deve criar nova lista com produtos iniciais', () => {
    const store = useCartStore.getState()
    const products: ProductProps[] = [
      { id: '1', item: 'Arroz', quantity: '1', price: '10', collected: false },
    ]
    store.addList('Lista com itens', products)

    const state = useCartStore.getState()
    expect(state.lists[1].products).toHaveLength(1)
    expect(state.lists[1].products[0].item).toBe('Arroz')
  })

  it('deve alternar entre listas', () => {
    const store = useCartStore.getState()
    store.addList('Segunda Lista')
    let state = useCartStore.getState()
    const secondListId = state.lists[1].id

    store.addList('Terceira Lista')
    state = useCartStore.getState()
    const thirdListId = state.lists[2].id

    store.setActiveList(secondListId)
    expect(useCartStore.getState().activeListId).toBe(secondListId)

    store.setActiveList(thirdListId)
    expect(useCartStore.getState().activeListId).toBe(thirdListId)
  })

  it('deve adicionar item à lista ativa', () => {
    const store = useCartStore.getState()
    store.addList('Segunda')
    const product: ProductProps = {
      id: '1',
      item: 'Feijão',
      quantity: '2',
      price: '8',
      collected: false,
    }
    store.add(product)

    const state = useCartStore.getState()
    expect(state.products).toHaveLength(1)
    expect(state.lists[1].products).toHaveLength(1)
  })

  it('deve remover lista (se não for a última)', () => {
    const store = useCartStore.getState()
    store.addList('Para remover')
    const state = useCartStore.getState()
    const listCount = state.lists.length

    store.removeList(state.lists[1].id)
    expect(useCartStore.getState().lists).toHaveLength(listCount - 1)
  })

  it('não deve remover a última lista', () => {
    const store = useCartStore.getState()
    store.removeList(store.lists[0].id)

    // Deve manter ao menos uma lista
    expect(useCartStore.getState().lists).toHaveLength(1)
  })

  it('deve renomear lista', () => {
    const store = useCartStore.getState()
    store.addList('Antigo Nome')
    let state = useCartStore.getState()
    const listId = state.lists[1].id

    store.renameList(listId, 'Novo Nome')
    state = useCartStore.getState()
    const list = state.lists.find((l) => l.id === listId)
    expect(list?.name).toBe('Novo Nome')
  })

  it('não deve renomear com nome vazio', () => {
    const store = useCartStore.getState()
    const originalName = store.lists[0].name

    store.renameList(store.lists[0].id, '')
    expect(useCartStore.getState().lists[0].name).toBe(originalName)

    store.renameList(store.lists[0].id, '   ')
    expect(useCartStore.getState().lists[0].name).toBe(originalName)
  })

  it('deve manter produtos separados por lista', () => {
    const store = useCartStore.getState()

    // Adicionar produto na lista 1
    const product1: ProductProps = {
      id: '1',
      item: 'Arroz',
      quantity: '1',
      price: '10',
      collected: false,
    }
    store.add(product1)
    let state = useCartStore.getState()
    const list1Id = state.lists[0].id
    expect(state.lists[0].products).toHaveLength(1)

    // Criar e ativar lista 2
    store.addList('Lista 2')
    state = useCartStore.getState()
    const list2Id = state.lists[1].id

    // Adicionar produto na lista 2
    const product2: ProductProps = {
      id: '2',
      item: 'Feijão',
      quantity: '2',
      price: '8',
      collected: false,
    }
    store.add(product2)
    state = useCartStore.getState()
    expect(state.lists[1].products).toHaveLength(1)

    // Verificar que lista 1 ainda tem apenas 1 item
    const list1 = useCartStore.getState().lists.find((l) => l.id === list1Id)
    expect(list1?.products).toHaveLength(1)
  })
})
