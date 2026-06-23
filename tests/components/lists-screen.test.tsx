import React from 'react'
import type { ReactNode } from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react-native'
import Lists from '@/app/lists'
import { INPUTS } from '@/constants/text/inputs'
import { ERROR } from '@/constants/text/error'
import { LISTS } from '@/constants/text/lists'
import { mockPush } from '../setup/mocks/expo-router'

const mockUseInitAlert = jest.fn()
const mockAlertOk = jest.fn()
const mockShowAlert = jest.fn()
const mockRemoveByListId = jest.fn(async (_listId: string) => undefined)
const mockGetByListId = jest.fn((_listId: string) => [] as Array<{ id: string }>)

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

jest.mock('@/stores/CartStore', () => ({
  useCartStore: () => mockStore,
}))

jest.mock('@/stores/ReminderStore', () => ({
  useReminderStore: () => ({
    getByListId: (listId: string) => mockGetByListId(listId),
  }),
}))

jest.mock('@/services/ReminderOrchestrator', () => ({
  ReminderOrchestrator: {
    removeByListId: (listId: string) => mockRemoveByListId(listId),
  },
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
  const ReactModule = jest.requireActual('react') as typeof import('react')
  return {
    CustomAlert: ReactModule.forwardRef((_props: unknown, ref: unknown) => {
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
    const ReactModule = jest.requireActual('react') as typeof import('react')
    const { Text } = jest.requireActual('react-native') as typeof import('react-native')
    return ReactModule.createElement(Text, null, 'Header')
  },
}))

jest.mock('@/components/Screen', () => ({
  Screen: ({ children }: { children: ReactNode }) => {
    const ReactModule = jest.requireActual('react') as typeof import('react')
    const { View } = jest.requireActual('react-native') as typeof import('react-native')
    return ReactModule.createElement(View, null, children)
  },
}))

jest.mock('@/components/TextWhite', () => ({
  TextWhite: ({ children }: { children: ReactNode }) => {
    const ReactModule = jest.requireActual('react') as typeof import('react')
    const { Text } = jest.requireActual('react-native') as typeof import('react-native')
    return ReactModule.createElement(Text, null, children)
  },
}))

jest.mock('@/components/Row', () => ({
  Row: ({ children }: { children: ReactNode }) => {
    const ReactModule = jest.requireActual('react') as typeof import('react')
    const { View } = jest.requireActual('react-native') as typeof import('react-native')
    return ReactModule.createElement(View, null, children)
  },
}))

jest.mock('@/components/Icons', () => ({
  AddIcon: () => {
    const ReactModule = jest.requireActual('react') as typeof import('react')
    const { Text } = jest.requireActual('react-native') as typeof import('react-native')
    return ReactModule.createElement(Text, null, 'AddIcon')
  },
  EditIcon: () => {
    const ReactModule = jest.requireActual('react') as typeof import('react')
    const { Text } = jest.requireActual('react-native') as typeof import('react-native')
    return ReactModule.createElement(Text, null, 'EditIcon')
  },
  TrashIcon: () => {
    const ReactModule = jest.requireActual('react') as typeof import('react')
    const { Text } = jest.requireActual('react-native') as typeof import('react-native')
    return ReactModule.createElement(Text, null, 'TrashIcon')
  },
  NotificationIcon: () => {
    const ReactModule = jest.requireActual('react') as typeof import('react')
    const { Text } = jest.requireActual('react-native') as typeof import('react-native')
    return ReactModule.createElement(Text, null, 'NotificationIcon')
  },
}))

describe('Lists screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetByListId.mockReturnValue([])
    mockStore.lists = [
      { id: 'list-1', name: 'Lista 1', products: [{ id: 'p1', item: 'Arroz', quantity: '1', price: '10', collected: false }] },
      { id: 'list-2', name: 'Lista 2', products: [] },
    ]
    mockStore.activeListId = 'list-1'
  })

  it('cria lista quando nome é válido', async () => {
    const { getByPlaceholderText, getByText } = render(<Lists />)

    fireEvent.changeText(getByPlaceholderText(INPUTS.placeholder.list_name), '  Feira  ')

    await waitFor(() => {
      fireEvent.press(getByText('AddIcon'))
    })

    expect(mockStore.addList).toHaveBeenCalledWith('Feira')
    expect(mockAlertOk).not.toHaveBeenCalled()
  })

  it('mostra erro ao tentar criar lista com nome vazio', async () => {
    const { getByText } = render(<Lists />)

    await waitFor(() => {
      fireEvent.press(getByText('AddIcon'))
    })

    await waitFor(() => {
      expect(mockAlertOk).toHaveBeenCalledWith(ERROR.alert_title, ERROR.empty_list_name)
    })
    expect(mockStore.addList).not.toHaveBeenCalled()
  })

  it('seleciona lista e navega para home', () => {
    const { getByText } = render(<Lists />)

    fireEvent.press(getByText('Lista 2'))

    expect(mockStore.setActiveList).toHaveBeenCalledWith('list-2')
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('renomeia lista no modo edição', async () => {
    const { getAllByText, getByDisplayValue, getByText } = render(<Lists />)

    fireEvent.press(getAllByText('EditIcon')[0])
    fireEvent.changeText(getByDisplayValue('Lista 1'), 'Lista Mercado')

    await waitFor(() => {
      fireEvent.press(getByText(LISTS.rename_save))
    })

    await waitFor(() => {
      expect(mockStore.renameList).toHaveBeenCalledWith('list-1', 'Lista Mercado')
    })
  })

  it('cancela edição da lista', () => {
    const { getAllByText, getByText, queryByText } = render(<Lists />)

    fireEvent.press(getAllByText('EditIcon')[0])
    fireEvent.press(getByText(LISTS.rename_cancel))

    expect(queryByText(LISTS.rename_save)).toBeNull()
    expect(mockStore.renameList).not.toHaveBeenCalled()
  })

  it('mostra erro ao remover última lista', () => {
    mockStore.lists = [{ id: 'list-1', name: 'Lista 1', products: [] }]

    const { getByText } = render(<Lists />)
    fireEvent.press(getByText('TrashIcon'))

    expect(mockAlertOk).toHaveBeenCalledWith(ERROR.alert_title, ERROR.cannot_remove_last_list)
    expect(mockShowAlert).not.toHaveBeenCalled()
  })

  it('abre confirmação e remove lista quando há mais de uma', async () => {
    const { getAllByText } = render(<Lists />)

    fireEvent.press(getAllByText('TrashIcon')[1])

    expect(mockShowAlert).toHaveBeenCalledTimes(1)

    const payload = mockShowAlert.mock.calls[0][0] as {
      buttons: Array<{ text: string; action: () => void }>
    }

    expect(payload.buttons[0].text).toBe(LISTS.confirm_remove_button)
    await payload.buttons[0].action()

    expect(mockStore.removeList).toHaveBeenCalledWith('list-2')
  })

  it('mostra impacto de lembretes ao remover lista', () => {
    mockGetByListId.mockReturnValue([{ id: 'r-1' }])

    const { getAllByText } = render(<Lists />)

    fireEvent.press(getAllByText('TrashIcon')[1])

    const payload = mockShowAlert.mock.calls[0][0] as {
      message: string
    }

    expect(payload.message).toContain('1 lembrete(s) também serão removidos')
  })
})
