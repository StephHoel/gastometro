import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import { List } from '@/components/List'
import { ListItem } from '@/components/List/ListItem'
import type { StateProps } from '@/interfaces/StateProps'
import { mockPush } from '../setup/mocks/expo-router'

const mockRemoveAlert = jest.fn()

jest.mock('@/services/AlertService', () => ({
  AlertService: {
    remove: (...args: unknown[]) => mockRemoveAlert(...args),
  },
}))

jest.mock('@/components/Icons', () => ({
  CheckboxIcon: ({ checked }: { checked?: boolean }) => {
    const ReactModule = jest.requireActual('react') as typeof import('react')
    const { Text } = jest.requireActual('react-native') as typeof import('react-native')
    return ReactModule.createElement(Text, null, checked ? 'checked' : 'unchecked')
  },
}))

jest.mock('@/components/TouchableIcons', () => ({
  Delete: ({ action }: { action: () => void }) => {
    const ReactModule = jest.requireActual('react') as typeof import('react')
    const { Pressable, Text } = jest.requireActual('react-native') as typeof import('react-native')
    return ReactModule.createElement(
      Pressable,
      { testID: 'delete-item', onPress: action },
      ReactModule.createElement(Text, null, 'Delete')
    )
  },
}))

function makeStore(): StateProps {
  return {
    lists: [{ id: 'list-1', name: 'Test', products: [] }],
    activeListId: 'list-1',
    products: [
      { id: '1', item: 'Arroz', quantity: '2', price: '10', collected: false },
      { id: '2', item: 'Banana', quantity: '1', price: '3', collected: false },
      { id: '3', item: 'Feijão', quantity: '1', price: '8', collected: true },
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

describe('List and ListItem interactions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('List deve renderizar seções e permitir toggle, edição e remoção', () => {
    const store = makeStore()
    const { getByText, getAllByTestId, getAllByText } = render(<List cartStore={store} />)

    expect(getByText('Não coletados')).toBeTruthy()
    expect(getByText('Coletados')).toBeTruthy()

    fireEvent.press(getAllByText('unchecked')[0])
    expect(store.edit).toHaveBeenCalled()

    fireEvent.press(getByText(/2x Arroz/))
    expect(mockPush).toHaveBeenCalledWith('/list/edit/1')

    fireEvent.press(getAllByTestId('delete-item')[0])
    expect(mockRemoveAlert).toHaveBeenCalled()
  })

  it('ListItem deve renderizar Divider apenas quando não for último item e disparar callbacks', () => {
    const onDelete = jest.fn()
    const onToggle = jest.fn()
    const onEdit = jest.fn()

    const product = { id: '1', item: 'Arroz', quantity: '2', price: '10', collected: false }

    const { getByTestId, getByText, queryByTestId, rerender } = render(
      <ListItem
        product={product}
        index={0}
        totalCount={2}
        onDelete={onDelete}
        onToggle={onToggle}
        onEdit={onEdit}
      />
    )

    expect(getByTestId('list-divider')).toBeTruthy()

    fireEvent.press(getByTestId('delete-item'))
    fireEvent.press(getByText('unchecked'))
    fireEvent.press(getByText(/2x Arroz/))

    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onToggle).toHaveBeenCalledTimes(1)
    expect(onEdit).toHaveBeenCalledTimes(1)

    rerender(
      <ListItem
        product={{ ...product, collected: true }}
        index={1}
        totalCount={2}
        onDelete={onDelete}
        onToggle={onToggle}
        onEdit={onEdit}
      />
    )

    expect(queryByTestId('list-divider')).toBeNull()
  })

  it('List deve ocultar cabeçalhos quando as listas estão vazias', () => {
    const store = makeStore()
    store.products = []

    const { queryByText } = render(<List cartStore={store} />)

    expect(queryByText('Não coletados')).toBeNull()
    expect(queryByText('Coletados')).toBeNull()
  })

  it('ListItem deve renderizar texto riscado quando coletado', () => {
    const product = { id: '9', item: 'Leite', quantity: '1', price: '6', collected: true }

    const { getByText } = render(
      <ListItem
        product={product}
        index={0}
        totalCount={1}
        onDelete={() => { }}
        onToggle={() => { }}
        onEdit={() => { }}
      />
    )

    expect(getByText(/1x Leite/)).toBeTruthy()
  })

  it('ListItem deve renderizar texto normal quando não coletado', () => {
    const product = { id: '10', item: 'Ovos', quantity: '12', price: '15', collected: false }

    const { getByText } = render(
      <ListItem
        product={product}
        index={0}
        totalCount={1}
        onDelete={() => { }}
        onToggle={() => { }}
        onEdit={() => { }}
      />
    )

    expect(getByText(/12x Ovos/)).toBeTruthy()
  })
})
