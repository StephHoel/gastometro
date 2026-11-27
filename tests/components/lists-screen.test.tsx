import React from 'react'
import type { ReactNode } from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react-native'
import Lists from '@/app/(tabs)/lists'
import { ERROR } from '@/constants/text/error'
import { LISTS } from '@/constants/text/lists'
import { mockPush } from '../setup/mocks/expo-router'
import { ROUTES } from '@/constants/routes'

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
    const { getByLabelText, getByRole } = await render(<Lists />)

    const nameInput = getByLabelText('Nome da nova lista')
    expect(nameInput.props.accessibilityHint).toBe('Digite um nome para criar uma lista de compras')
    await fireEvent.changeText(nameInput, '  Feira  ')
    await fireEvent.press(getByRole('button', { name: 'Criar lista' }))

    expect(mockStore.addList).toHaveBeenCalledWith('Feira')
    expect(mockAlertOk).not.toHaveBeenCalled()
  }, 10000)

  it('mostra erro ao tentar criar lista com nome vazio', async () => {
    const { getByRole } = await render(<Lists />)

    await fireEvent.press(getByRole('button', { name: 'Criar lista' }))

    await waitFor(() => {
      expect(mockAlertOk).toHaveBeenCalledWith(ERROR.alert_title, ERROR.empty_list_name)
    })
    expect(mockStore.addList).not.toHaveBeenCalled()
  })

  it('seleciona lista e navega para home', async () => {
    const { getByRole } = await render(<Lists />)

    expect(getByRole('button', { name: 'Selecionar lista Lista 1' }).props.accessibilityState).toEqual({ selected: true })
    const inactiveList = getByRole('button', { name: 'Selecionar lista Lista 2' })
    expect(inactiveList.props.accessibilityState).toEqual({ selected: false })
    await fireEvent.press(inactiveList)

    expect(mockStore.setActiveList).toHaveBeenCalledWith('list-2')
    expect(mockPush).toHaveBeenCalledWith(ROUTES.Index)
  })

  it('renomeia lista no modo edição', async () => {
    const { getByRole, getByLabelText } = await render(<Lists />)

    await fireEvent.press(getByRole('button', { name: 'Renomear lista Lista 1' }))
    const editInput = getByLabelText('Nome da lista Lista 1')
    expect(editInput.props.accessibilityHint).toBe('Edite o nome e salve as alterações')
    await fireEvent.changeText(editInput, 'Lista Mercado')

    await waitFor(async () => {
      await fireEvent.press(getByRole('button', { name: 'Salvar nome da lista Lista 1' }))
    })

    await waitFor(() => {
      expect(mockStore.renameList).toHaveBeenCalledWith('list-1', 'Lista Mercado')
    })
  })

  it('cancela edição da lista', async () => {
    const { getByRole, queryByText } = await render(<Lists />)

    await fireEvent.press(getByRole('button', { name: 'Renomear lista Lista 1' }))
    await fireEvent.press(getByRole('button', { name: 'Cancelar edição da lista Lista 1' }))

    expect(queryByText(LISTS.rename_save)).toBeNull()
    expect(mockStore.renameList).not.toHaveBeenCalled()
  })

  it('mostra erro ao remover última lista', async () => {
    mockStore.lists = [{ id: 'list-1', name: 'Lista 1', products: [] }]

    const { getByRole } = await render(<Lists />)
    await fireEvent.press(getByRole('button', { name: 'Remover lista Lista 1' }))

    expect(mockAlertOk).toHaveBeenCalledWith(ERROR.alert_title, ERROR.cannot_remove_last_list)
    expect(mockShowAlert).not.toHaveBeenCalled()
  })

  it('abre confirmação e remove lista quando há mais de uma', async () => {
    const { getByRole } = await render(<Lists />)

    await fireEvent.press(getByRole('button', { name: 'Remover lista Lista 2' }))

    expect(mockShowAlert).toHaveBeenCalledTimes(1)

    const payload = mockShowAlert.mock.calls[0][0] as {
      buttons: Array<{ text: string; action: () => void }>
    }

    expect(payload.buttons[0].text).toBe(LISTS.confirm_remove_button)
    await payload.buttons[0].action()

    expect(mockStore.removeList).toHaveBeenCalledWith('list-2')
  })


  it('aguarda a limpeza dos lembretes antes de remover a lista', async () => {
    let finishCleanup: (() => void) | undefined
    mockRemoveByListId.mockImplementationOnce(
      () => new Promise<undefined>((resolve) => { finishCleanup = () => resolve(undefined) }),
    )

    const { getByRole } = await render(<Lists />)
    await fireEvent.press(getByRole('button', { name: 'Remover lista Lista 2' }))

    const payload = mockShowAlert.mock.calls[0][0] as {
      buttons: Array<{ action: () => Promise<void> }>
    }
    const removal = payload.buttons[0].action()

    expect(mockRemoveByListId).toHaveBeenCalledWith('list-2')
    expect(mockStore.removeList).not.toHaveBeenCalled()

    finishCleanup?.()
    await removal

    expect(mockStore.removeList).toHaveBeenCalledWith('list-2')
  })

  it('mostra impacto de lembretes ao remover lista', async () => {
    mockGetByListId.mockReturnValue([{ id: 'r-1' }])

    const { getByRole } = await render(<Lists />)

    await fireEvent.press(getByRole('button', { name: 'Remover lista Lista 2' }))

    const payload = mockShowAlert.mock.calls[0][0] as {
      message: string
    }

    expect(payload.message).toContain('1 lembrete(s) também serão removidos')
  })
  it('rejeita nome vazio ao renomear e preserva a lista', async () => {
    const { getByRole, getByLabelText } = await render(<Lists />)

    await fireEvent.press(getByRole('button', { name: 'Renomear lista Lista 1' }))
    await fireEvent.changeText(getByLabelText('Nome da lista Lista 1'), '   ')
    await fireEvent.press(getByRole('button', { name: 'Salvar nome da lista Lista 1' }))

    expect(mockAlertOk).toHaveBeenCalledWith(ERROR.alert_title, ERROR.empty_list_name)
    expect(mockStore.renameList).not.toHaveBeenCalled()
  })

  it('abre os lembretes da lista pelo controle identificado', async () => {
    const { getByRole } = await render(<Lists />)

    await fireEvent.press(getByRole('button', { name: 'Abrir lembretes da lista Lista 1' }))
    expect(mockPush).toHaveBeenCalledWith('/reminders/list-1')
  })

  it('mostra o plural para listas com mais de um produto', async () => {
    mockStore.lists[1].products = [
      { id: 'p2', item: 'Feijão', quantity: '1', price: '8', collected: false },
      { id: 'p3', item: 'Macarrão', quantity: '2', price: '6', collected: false },
    ]
    const { getByText } = await render(<Lists />)

    expect(getByText('2 itens')).toBeTruthy()
  })

})
