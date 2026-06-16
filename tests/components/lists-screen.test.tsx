import React from 'react'
import type { ReactNode } from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import { text } from '@/constants/text'

const mockPush = jest.fn()
const mockUseInitAlert = jest.fn()
const mockAlertOk = jest.fn()
const mockShowAlert = jest.fn()

const mockStore = {
  lists: [
    { id: 'list-1', name: 'Lista 1', products: [{ id: 'p1', item: 'Arroz', quantity: '1', price: '10', collected: false }] },
    { id: 'list-2', name: 'Lista 2', products: [] },
  ],
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

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('@/stores/CartStore', () => ({
  useCartStore: () => mockStore,
}))

jest.mock('@/hooks/useInitAlert', () => ({
  useInitAlert: (...args: unknown[]) => mockUseInitAlert(...args),
}))

jest.mock('@/services/AlertService', () => ({
  AlertService: {
    ok: (...args: unknown[]) => mockAlertOk(...args),
  },
}))

jest.mock('@/components/CustomAlert', () => {
  const React = require('react')
  const { forwardRef } = require('react')
  return {
    CustomAlert: forwardRef((_props: unknown, ref: unknown) => {
      if (ref && typeof ref === 'object') {
        ; (ref as { current?: { showAlert?: unknown } }).current = {
          showAlert: mockShowAlert,
        }
      }
      return null
    }),
  }
})

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

jest.mock('@/components/Row', () => ({
  Row: ({ children }: { children: ReactNode }) => {
    const React = require('react')
    const { View } = require('react-native')
    return <View>{children}</View>
  },
}))

jest.mock('@/components/Icons', () => ({
  AddIcon: () => {
    const React = require('react')
    const { Text } = require('react-native')
    return <Text>AddIcon</Text>
  },
  EditIcon: () => {
    const React = require('react')
    const { Text } = require('react-native')
    return <Text>EditIcon</Text>
  },
  TrashIcon: () => {
    const React = require('react')
    const { Text } = require('react-native')
    return <Text>TrashIcon</Text>
  },
}))

import Lists from '@/app/lists'

describe('Lists screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockStore.lists = [
      { id: 'list-1', name: 'Lista 1', products: [{ id: 'p1', item: 'Arroz', quantity: '1', price: '10', collected: false }] },
      { id: 'list-2', name: 'Lista 2', products: [] },
    ]
    mockStore.activeListId = 'list-1'
  })

  it('cria lista quando nome é válido', () => {
    const { getByPlaceholderText, getByText } = render(<Lists />)

    fireEvent.changeText(getByPlaceholderText(text.input.placeholder.list_name), '  Feira  ')
    fireEvent.press(getByText('AddIcon'))

    expect(mockStore.addList).toHaveBeenCalledWith('Feira')
    expect(mockAlertOk).not.toHaveBeenCalled()
  })

  it('mostra erro ao tentar criar lista com nome vazio', () => {
    const { getByText } = render(<Lists />)

    fireEvent.press(getByText('AddIcon'))

    expect(mockAlertOk).toHaveBeenCalledWith(text.error.alert_title, text.error.empty_list_name)
    expect(mockStore.addList).not.toHaveBeenCalled()
  })

  it('seleciona lista e navega para home', () => {
    const { getByText } = render(<Lists />)

    fireEvent.press(getByText('Lista 2'))

    expect(mockStore.setActiveList).toHaveBeenCalledWith('list-2')
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('renomeia lista no modo edição', () => {
    const { getAllByText, getByDisplayValue, getByText } = render(<Lists />)

    fireEvent.press(getAllByText('EditIcon')[0])
    fireEvent.changeText(getByDisplayValue('Lista 1'), 'Lista Mercado')
    fireEvent.press(getByText(text.lists.rename_save))

    expect(mockStore.renameList).toHaveBeenCalledWith('list-1', 'Lista Mercado')
  })

  it('cancela edição da lista', () => {
    const { getAllByText, getByText, queryByText } = render(<Lists />)

    fireEvent.press(getAllByText('EditIcon')[0])
    fireEvent.press(getByText(text.lists.rename_cancel))

    expect(queryByText(text.lists.rename_save)).toBeNull()
    expect(mockStore.renameList).not.toHaveBeenCalled()
  })

  it('mostra erro ao remover última lista', () => {
    mockStore.lists = [{ id: 'list-1', name: 'Lista 1', products: [] }]

    const { getByText } = render(<Lists />)
    fireEvent.press(getByText('TrashIcon'))

    expect(mockAlertOk).toHaveBeenCalledWith(text.error.alert_title, text.error.cannot_remove_last_list)
    expect(mockShowAlert).not.toHaveBeenCalled()
  })

  it('abre confirmação e remove lista quando há mais de uma', () => {
    const { getAllByText } = render(<Lists />)

    fireEvent.press(getAllByText('TrashIcon')[1])

    expect(mockShowAlert).toHaveBeenCalledTimes(1)

    const payload = mockShowAlert.mock.calls[0][0] as {
      buttons: Array<{ text: string; action: () => void }>
    }

    expect(payload.buttons[0].text).toBe(text.lists.confirm_remove_button)
    payload.buttons[0].action()

    expect(mockStore.removeList).toHaveBeenCalledWith('list-2')
  })
})
