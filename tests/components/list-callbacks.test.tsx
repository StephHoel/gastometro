import React from 'react'
import { render } from '@testing-library/react-native'
import { List } from '@/components/List'
import type { StateProps } from '@/interfaces/StateProps'
import { mockPush } from '../setup/mocks/expo-router'

const mockRemoveAlert = jest.fn()
const mockSortProductsByCollected = jest.fn()
const mockListItem = jest.fn((_props: unknown) => null)

jest.mock('@/services/AlertService', () => ({
  AlertService: {
    remove: (...args: unknown[]) => mockRemoveAlert(...args),
  },
}))

jest.mock('@/utils/functions/SortList', () => ({
  SortProductsByCollected: (...args: unknown[]) => mockSortProductsByCollected(...args),
}))

jest.mock('@/components/List/ListItem', () => ({
  ListItem: (props: unknown) => mockListItem(props),
}))

function makeStore(): StateProps {
  return {
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
}

describe('List callbacks coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSortProductsByCollected.mockReturnValue({
      notCollected: [{ id: '1', item: 'Arroz', quantity: '2', price: '10', collected: false }],
      collected: [{ id: '2', item: 'Feijão', quantity: '1', price: '8', collected: true }],
    })
  })

  it('deve executar callbacks criados para itens coletados e não coletados', () => {
    const store = makeStore()

    render(<List cartStore={store} />)

    expect(mockListItem).toHaveBeenCalledTimes(2)

    const firstCall = mockListItem.mock.calls[0]
    const secondCall = mockListItem.mock.calls[1]

    if (!firstCall || !secondCall) {
      throw new Error('ListItem deveria ter sido chamado duas vezes')
    }

    const firstProps = firstCall[0] as {
      onDelete: () => void
      onToggle: () => void
      onEdit: () => void
    }
    const secondProps = secondCall[0] as {
      onDelete: () => void
      onToggle: () => void
      onEdit: () => void
    }

    firstProps.onDelete()
    firstProps.onToggle()
    firstProps.onEdit()

    secondProps.onDelete()
    secondProps.onToggle()
    secondProps.onEdit()

    expect(mockRemoveAlert).toHaveBeenCalledTimes(2)
    expect(store.edit).toHaveBeenCalledTimes(2)
    expect(mockPush).toHaveBeenCalledWith('/list/edit/1')
    expect(mockPush).toHaveBeenCalledWith('/list/edit/2')
  })
})
