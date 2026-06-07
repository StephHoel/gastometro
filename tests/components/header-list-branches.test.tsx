import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { fireEvent, render } from '@testing-library/react-native'
import { Header } from '@/components/Header'
import { List } from '@/components/List'
import { useRouter } from 'expo-router'
import { useRoute } from 'expo-router/react-navigation'
import type { StateProps } from '@/interfaces/StateProps'

const mockPush = jest.fn()
const mockRemove = jest.fn()
const mockShare = jest.fn()
const mockPaste = jest.fn(() => Promise.resolve())

let mockProductsState = [
  { id: '1', item: 'Arroz', quantity: '2', price: '10', collected: false },
  { id: '2', item: 'Feijão', quantity: '1', price: '8', collected: true },
]

const mockClear = jest.fn()
const mockEdit = jest.fn()
const mockRemoveItem = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}))

jest.mock('expo-router/react-navigation', () => ({
  useRoute: jest.fn(),
}))

jest.mock('@/stores/CartStore', () => ({
  useCartStore: () => ({
    products: mockProductsState,
    clear: mockClear,
  }),
}))

jest.mock('@/hooks/useInitAlert', () => ({
  useInitAlert: jest.fn(),
}))

jest.mock('@/components/CustomAlert', () => ({
  CustomAlert: () => null,
}))

jest.mock('@/services/AlertService', () => ({
  AlertService: {
    remove: (...args: unknown[]) => mockRemove(...args),
    share: (...args: unknown[]) => mockShare(...args),
    paste: (...args: unknown[]) => mockPaste(...args),
  },
}))

jest.mock('@/components/TouchableIcons', () => ({
  Add: ({ action }: { action?: () => void }) => {
    const React = require('react')
    const { Text } = require('react-native')
    return <Text onPress={action}>Add</Text>
  },
  Back: ({ action }: { action?: () => void }) => {
    const React = require('react')
    const { Text } = require('react-native')
    return <Text onPress={action}>Back</Text>
  },
  Delete: ({ action }: { action?: () => void }) => {
    const React = require('react')
    const { Text } = require('react-native')
    return <Text onPress={action}>Delete</Text>
  },
  Share: ({ action }: { action?: () => void }) => {
    const React = require('react')
    const { Text } = require('react-native')
    return <Text onPress={action}>Share</Text>
  },
}))

describe('Header and List branch coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockProductsState = [
      { id: '1', item: 'Arroz', quantity: '2', price: '10', collected: false },
      { id: '2', item: 'Feijão', quantity: '1', price: '8', collected: true },
    ]
      ; (useRouter as jest.Mock).mockReturnValue({ push: mockPush })
      ; (useRoute as jest.Mock).mockReturnValue({ name: 'index' })
  })

  it('Header index: executa remove e share quando há produtos', async () => {
    const { getByText } = render(<Header />)

    fireEvent.press(getByText('Delete'))
    fireEvent.press(getByText('Share'))
    fireEvent.press(getByText('Add'))

    expect(mockRemove).toHaveBeenCalled()
    expect(mockShare).toHaveBeenCalled()
    expect(mockPaste).not.toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/list/add')
  })

  it('Header index: usa paste quando lista está vazia', async () => {
    mockProductsState = []

    const { getByText, queryByText } = render(<Header />)

    fireEvent.press(getByText('Share'))

    expect(queryByText('Delete')).toBeNull()
    expect(mockPaste).toHaveBeenCalled()
    expect(mockShare).not.toHaveBeenCalled()
  })

  it('Header default: renderiza back e navega para /', () => {
    ; (useRoute as jest.Mock).mockReturnValue({ name: 'list/edit/[id]' })

    const { getByText, queryByText } = render(<Header />)

    fireEvent.press(getByText('Back'))

    expect(mockPush).toHaveBeenCalledWith('/')
    expect(queryByText('Add')).toBeNull()
  })

  it('Header calculator: não renderiza ações', () => {
    ; (useRoute as jest.Mock).mockReturnValue({ name: 'calculator' })

    const { queryByText } = render(<Header />)

    expect(queryByText('Back')).toBeNull()
    expect(queryByText('Share')).toBeNull()
    expect(queryByText('Add')).toBeNull()
  })

  it('List: alterna collected, navega para edição e aciona remoção', () => {
    const cartStore: StateProps = {
      products: mockProductsState,
      add: jest.fn(),
      edit: mockEdit,
      replace: jest.fn(),
      remove: mockRemoveItem,
      get: jest.fn(),
      clear: jest.fn(),
    }

    const { getAllByText, UNSAFE_getAllByType } = render(<List cartStore={cartStore} />)

    const touchables = UNSAFE_getAllByType(TouchableOpacity)
    fireEvent.press(touchables[0])
    fireEvent.press(touchables[1])
    fireEvent.press(getAllByText('Delete')[0])

    expect(mockEdit).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/list/edit/1')
    expect(mockRemove).toHaveBeenCalled()
  })
})
