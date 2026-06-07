import React from 'react'
import { render } from '@testing-library/react-native'
import Home from '@/app/index'
import { SetCurrency } from '@/utils/functions/MathFunctions'

jest.mock('@/stores/CartStore', () => ({
  useCartStore: jest.fn(),
}))

jest.mock('@/hooks/useInitAlert', () => ({
  useInitAlert: jest.fn(),
}))

jest.mock('@/components/CustomAlert', () => ({
  CustomAlert: () => null,
}))

jest.mock('@/components/Header', () => ({
  Header: () => null,
}))

jest.mock('@/components/List', () => ({
  List: () => null,
}))

import { useCartStore } from '@/stores/CartStore'

describe('Home totals', () => {
  beforeEach(() => {
    ; (useCartStore as unknown as jest.Mock).mockReturnValue({
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
    })
  })

  it('deve renderizar Total Geral e Total Coletado lado a lado com valores formatados', () => {
    const expectedTotal = SetCurrency(28)
    const expectedCollected = SetCurrency(8)

    const { getByText } = render(<Home />)

    expect(getByText(`Total Geral: ${expectedTotal}`)).toBeTruthy()
    expect(getByText('|')).toBeTruthy()
    expect(getByText(`Total Coletado: ${expectedCollected}`)).toBeTruthy()
  })

  it('deve renderizar totais zerados quando a lista estiver vazia', () => {
    ; (useCartStore as unknown as jest.Mock).mockReturnValue({
      products: [],
      add: jest.fn(),
      edit: jest.fn(),
      replace: jest.fn(),
      remove: jest.fn(),
      get: jest.fn(),
      clear: jest.fn(),
    })

    const { getByText } = render(<Home />)

    expect(getByText(`Total Geral: ${SetCurrency(0)}`)).toBeTruthy()
    expect(getByText(`Total Coletado: ${SetCurrency(0)}`)).toBeTruthy()
  })
})
