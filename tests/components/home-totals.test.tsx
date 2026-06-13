import { ReduceCollectedProducts, ReduceProducts, SetCurrency } from '@/utils/functions/MathFunctions'

describe('Home totals', () => {
  it('deve calcular Total Geral e Total Coletado lado a lado com valores formatados', () => {
    const cartStore = {
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
    }

    const expectedTotal = SetCurrency(28)
    const expectedCollected = SetCurrency(8)

    expect(SetCurrency(ReduceProducts(cartStore))).toBe(expectedTotal)
    expect(SetCurrency(ReduceCollectedProducts(cartStore))).toBe(expectedCollected)
  })

  it('deve calcular totais zerados quando a lista estiver vazia', () => {
    const emptyStore = {
      products: [],
      add: jest.fn(),
      edit: jest.fn(),
      replace: jest.fn(),
      remove: jest.fn(),
      get: jest.fn(),
      clear: jest.fn(),
    }

    expect(SetCurrency(ReduceProducts(emptyStore))).toBe(SetCurrency(0))
    expect(SetCurrency(ReduceCollectedProducts(emptyStore))).toBe(SetCurrency(0))
  })
})
