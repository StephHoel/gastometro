import { SortProductsAlphabetically } from '@/utils/functions/SortList'

describe('SortList', () => {
  it('deve ordenar itens alfabeticamente sem mutar array original', () => {
    const original = [
      { id: '1', item: 'Feijão', quantity: '1', price: '8', collected: false },
      { id: '2', item: 'abóbora', quantity: '1', price: '5', collected: false },
      { id: '3', item: 'Arroz', quantity: '1', price: '10', collected: false },
    ]

    const result = SortProductsAlphabetically(original)

    expect(result.map((p) => p.item)).toEqual(['abóbora', 'Arroz', 'Feijão'])
    expect(original.map((p) => p.item)).toEqual(['Feijão', 'abóbora', 'Arroz'])
  })
})
