import React, { ReactNode } from 'react'
import { render } from '@testing-library/react-native'

const mockUseCartStore = jest.fn()
const mockUseInitAlert = jest.fn()

jest.mock('@/stores/CartStore', () => ({
  useCartStore: () => mockUseCartStore(),
}))

jest.mock('@/hooks/useInitAlert', () => ({
  useInitAlert: (...args: unknown[]) => mockUseInitAlert(...args),
}))

jest.mock('@/components/CustomAlert', () => ({
  CustomAlert: () => null,
}))

jest.mock('@/components/Header', () => ({
  Header: () => {
    const React = require('react')
    const { Text } = require('react-native')
    return <Text>Header</Text>
  },
}))

jest.mock('@/components/Screen', () => ({
  Screen: ({ children }: { children: ReactNode }) => {
    const React = require('react')
    const { View } = require('react-native')
    return <View>{children}</View>
  },
}))

jest.mock('@/components/TextWhite', () => ({
  TextWhite: ({ children }: { children: ReactNode }) => {
    const React = require('react')
    const { Text } = require('react-native')
    return <Text>{children}</Text>
  },
}))

jest.mock('@/components/List', () => ({
  List: ({ cartStore }: { cartStore: { products: unknown[] } }) => {
    const React = require('react')
    const { Text } = require('react-native')
    return <Text testID="list-products-count">{cartStore.products.length}</Text>
  },
}))

import Home from '@/app/index'

describe('Home screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockUseCartStore.mockReturnValue({
      lists: [{ id: 'list-1', name: 'Mercado', products: [] }],
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
    })
  })

  it('renderiza totais e lista com dados do store', () => {
    const { getByText, getByTestId } = render(<Home />)

    expect(getByText('Header')).toBeTruthy()
    expect(getByText(/Total Geral:/)).toBeTruthy()
    expect(getByText(/Total Coletado:/)).toBeTruthy()
    expect(getByTestId('list-products-count').props.children).toBe(2)
    expect(mockUseInitAlert).toHaveBeenCalledTimes(1)
  })
})
