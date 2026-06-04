import * as CartInMemory from '@/stores/helpers/CartInMemory'
import type { ProductProps } from '@/interfaces/ProductProps'

const productsBase: ProductProps[] = [
  { id: '2', item: 'Feijão', quantity: '1', price: '8', collected: false },
  { id: '1', item: 'Arroz', quantity: '2', price: '10', collected: false },
]

describe('CartInMemory', () => {
  it('add deve inserir e ordenar alfabeticamente', () => {
    const result = CartInMemory.add(productsBase, {
      id: '3',
      item: 'Abóbora',
      quantity: '1',
      price: '5',
      collected: false,
    })

    expect(result.map((p) => p.item)).toEqual(['Abóbora', 'Arroz', 'Feijão'])
  })

  it('replace deve retornar lista ordenada', () => {
    const result = CartInMemory.replace(productsBase)

    expect(result.map((p) => p.item)).toEqual(['Arroz', 'Feijão'])
  })

  it('remove deve remover por id', () => {
    const result = CartInMemory.remove(productsBase, '1')

    expect(result).toEqual([{ id: '2', item: 'Feijão', quantity: '1', price: '8', collected: false }])
  })

  it('edit deve mesclar, editar e manter ordenação', () => {
    const result = CartInMemory.edit(productsBase, {
      id: '2',
      item: 'Amendoim',
      quantity: '3',
      price: '12',
      collected: true,
    })

    expect(result.map((p) => p.item)).toEqual(['Amendoim', 'Arroz'])
    expect(result.find((p) => p.id === '2')).toEqual({
      id: '2',
      item: 'Amendoim',
      quantity: '3',
      price: '12',
      collected: true,
    })
  })

  it('get deve retornar item por id ou undefined', () => {
    expect(CartInMemory.get(productsBase, '1')?.item).toBe('Arroz')
    expect(CartInMemory.get(productsBase, '99')).toBeUndefined()
  })
})
