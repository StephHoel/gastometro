import { useCartStore } from '@/stores/CartStore'
import type { ProductProps } from '@/interfaces/ProductProps'

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ products: [] })
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
})
