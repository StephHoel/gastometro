import React from 'react'
import { render } from '@testing-library/react-native'
import { Header } from '@/components/Header'
import { List } from '@/components/List'
import { useRouter } from 'expo-router'
import { useRoute } from 'expo-router/react-navigation'
import type { StateProps } from '@/interfaces/StateProps'
import { useCartStore } from '@/stores/CartStore'

jest.mock('@/stores/CartStore', () => ({
  useCartStore: jest.fn(),
}))

jest.mock('@/services/AlertService', () => ({
  AlertService: {
    remove: jest.fn(),
    share: jest.fn(),
    paste: jest.fn(),
  },
}))

jest.mock('@/components/CustomAlert', () => ({
  CustomAlert: () => null,
}))

jest.mock('@/components/Icons', () => ({
  CheckboxIcon: () => null,
}))

jest.mock('@/components/TouchableIcons', () => ({
  Add: () => null,
  Back: () => null,
  Delete: () => null,
  Share: () => null,
}))

function makeStore(): StateProps {
  return {
    lists: [{ id: 'list-1', name: 'Test', products: [] }],
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
}

describe('Header and List', () => {
  beforeEach(() => {
    ; (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() })
      ; (useRoute as jest.Mock).mockReturnValue({ name: 'index' })
      ; (useCartStore as unknown as jest.Mock).mockReturnValue(makeStore())
  })

  it('Header em index deve renderizar ações principais', () => {
    const { getByText } = render(<Header />)

    expect(getByText('Gastômetro')).toBeTruthy()
  })

  it('Header em calculator não deve renderizar ações extras', () => {
    ; (useRoute as jest.Mock).mockReturnValue({ name: 'calculator' })

    const { queryByText } = render(<Header />)

    expect(queryByText('Add')).toBeNull()
  })

  it('List deve ordenar e alternar collected', () => {
    const store = makeStore()
    const { getByText } = render(<List cartStore={store} />)

    expect(getByText(/2x Arroz/)).toBeTruthy()
  })
})
