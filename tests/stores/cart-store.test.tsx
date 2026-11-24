import { useCartStore } from '@/stores/CartStore'
import type { ProductProps } from '@/interfaces/ProductProps'

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.setState({
      lists: [{ id: 'list-1', name: 'Lista 1', products: [] }],
      activeListId: 'list-1',
      products: [],
    })
  })

  it('deve adicionar item usando ordenação do helper', () => {
    const arroz: ProductProps = { id: '1', item: 'Arroz', quantity: '1', price: '10', collected: false }
    const feijao: ProductProps = { id: '2', item: 'Feijão', quantity: '1', price: '8', collected: false }

    useCartStore.getState().add(feijao)
    useCartStore.getState().add(arroz)

    expect(useCartStore.getState().products.map((p) => p.item)).toEqual(['Arroz', 'Feijão'])
  })

  it('deve permitir get, edit, remove, replace e clear', () => {
    const store = useCartStore.getState()

    store.replace([{ id: '1', item: 'Arroz', quantity: '1', price: '10', collected: false }])
    expect(store.get('1')?.item).toBe('Arroz')

    store.edit({ id: '1', item: 'Arroz Integral', quantity: '2', price: '11', collected: true })
    expect(store.get('1')).toEqual({
      id: '1',
      item: 'Arroz Integral',
      quantity: '2',
      price: '11',
      collected: true,
    })

    store.remove('1')
    expect(store.get('1')).toBeUndefined()

    store.replace([{ id: '3', item: 'Macarrão', quantity: '1', price: '7', collected: false }])
    expect(store.get('3')).toBeDefined()

    store.clear()
    expect(useCartStore.getState().products).toEqual([])
  })
  it('protege a lista única e ignora nomes vazios', () => {
    const store = useCartStore.getState()

    store.addList('   ')
    store.removeList('list-1')
    store.renameList('list-1', '   ')

    expect(useCartStore.getState().lists).toEqual([
      { id: 'list-1', name: 'Lista 1', products: [] },
    ])
    expect(useCartStore.getState().activeListId).toBe('list-1')
  })

  it('remove listas ativas e inativas mantendo a lista ativa correta', () => {
    const store = useCartStore.getState()
    store.addList('Lista 2', [
      { id: 'p2', item: 'Feijão', quantity: '1', price: '8', collected: false },
    ])
    const secondListId = useCartStore.getState().activeListId

    store.removeList('list-1')
    expect(useCartStore.getState().activeListId).toBe(secondListId)
    expect(useCartStore.getState().products.map((product) => product.id)).toEqual(['p2'])

    store.addList('Lista 3')
    const thirdListId = useCartStore.getState().activeListId
    store.removeList(thirdListId)

    expect(useCartStore.getState().activeListId).toBe(secondListId)
    expect(useCartStore.getState().products.map((product) => product.id)).toEqual(['p2'])
  })

  it('renomeia listas com trim e ignora seleção inválida ou repetida', () => {
    const store = useCartStore.getState()
    store.addList(' Lista 2 ')
    const secondListId = useCartStore.getState().activeListId

    store.renameList(secondListId, '  Mercado  ')
    expect(useCartStore.getState().lists.find((list) => list.id === secondListId)?.name).toBe('Mercado')

    const before = useCartStore.getState().products
    store.setActiveList('inexistente')
    store.setActiveList(secondListId)
    expect(useCartStore.getState().activeListId).toBe(secondListId)
    expect(useCartStore.getState().products).toBe(before)

    store.setActiveList('list-1')
    expect(useCartStore.getState().activeListId).toBe('list-1')
    expect(useCartStore.getState().products).toEqual([])
  })

})
