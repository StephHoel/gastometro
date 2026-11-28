import { ReduceCollectedProducts, ReduceProducts, SetCurrency } from '@/utils/functions/MathFunctions'
import type { StateProps } from '@/interfaces/StateProps'

describe('Home totals', () => {
  it('deve calcular Total Geral e Total Coletado lado a lado com valores formatados', () => {
    const cartStore: StateProps = {
      lists: [{
        id: 'list-1',
        name: 'Test',
        products: [
          { id: '1', item: 'Arroz', quantity: '2', price: '10', collected: false },
          { id: '2', item: 'Feijão', quantity: '1', price: '8', collected: true },
        ]
      }],
      activeListId: 'list-1',
      products: [
        { id: '1', item: 'Arroz', quantity: '2', price: '10', collected: false },
        { id: '2', item: 'Feijão', quantity: '1', price: '8', collected: true },
      ],
      add: jest.fn(),
      edit: jest.fn(),
      replace: jest.fn(),
      remove: jest.fn(),
      get: jest.fn(),
      clear: jest.fn(),
      addList: jest.fn(),
      removeList: jest.fn(),
      renameList: jest.fn(),
      setActiveList: jest.fn(),
    }

    const expectedTotal = SetCurrency(28)
    const expectedCollected = SetCurrency(8)

    expect(SetCurrency(ReduceProducts(cartStore))).toBe(expectedTotal)
    expect(SetCurrency(ReduceCollectedProducts(cartStore))).toBe(expectedCollected)
  })

  it('deve calcular totais zerados quando a lista estiver vazia', () => {
    const emptyStore: StateProps = {
      lists: [{ id: 'list-1', name: 'Test', products: [] }],
      activeListId: 'list-1',
      products: [],
      add: jest.fn(),
      edit: jest.fn(),
      replace: jest.fn(),
      remove: jest.fn(),
      get: jest.fn(),
      clear: jest.fn(),
      addList: jest.fn(),
      removeList: jest.fn(),
      renameList: jest.fn(),
      setActiveList: jest.fn(),
    }

    expect(SetCurrency(ReduceProducts(emptyStore))).toBe(SetCurrency(0))
    expect(SetCurrency(ReduceCollectedProducts(emptyStore))).toBe(SetCurrency(0))
  })
})
