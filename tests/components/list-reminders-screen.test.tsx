import React, { type ReactNode } from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import ListReminders from '@/app/reminders/[listId]/index'
import { REMINDERS } from '@/constants/text/reminders'
import { ReminderOrchestrator } from '@/services/ReminderOrchestrator'
import { ReminderService } from '@/services/ReminderService'
import { useLocalSearchParams } from 'expo-router'
import { createCartStoreMock, createReminderStoreMock, makeReminder } from '../setup/helpers/reminder-test-factories'
import { mockPush } from '../setup/mocks/expo-router'

const mockShowAlert = jest.fn()
let capturedAlertCallback: (() => Promise<void>) | null = null

let mockCartStore = createCartStoreMock()
let mockReminderStore = createReminderStoreMock()

jest.mock('@/stores/CartStore', () => ({
  useCartStore: () => mockCartStore,
}))

jest.mock('@/stores/ReminderStore', () => ({
  useReminderStore: () => mockReminderStore,
}))

jest.mock('@/hooks/useInitAlert', () => ({
  useInitAlert: jest.fn(),
}))

jest.mock('@/services/ReminderOrchestrator', () => ({
  ReminderOrchestrator: {
    removeReminder: jest.fn(),
  },
}))

jest.mock('@/services/ReminderService', () => ({
  ReminderService: {
    getStatus: jest.fn(() => 'Ativo'),
  },
}))

jest.mock('@/services/AlertService', () => ({
  AlertService: {
    removeReminder: jest.fn((callback: () => Promise<void>) => {
      capturedAlertCallback = callback
    }),
  },
}))

jest.mock('@/utils/functions/DateFunctions', () => ({
  toDisplayDate: jest.fn((value: string) => value),
}))

jest.mock('@/components/Page', () => ({
  Page: ({ children, alertRef }: { children: ReactNode; alertRef: { current: unknown } }) => {
    if (alertRef && typeof alertRef === 'object') {
      alertRef.current = {
        showAlert: mockShowAlert,
      }
    }

    return children
  },
}))

jest.mock('@/components/TextWhite', () => ({
  TextWhite: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => {
    const ReactModule = jest.requireActual('react') as typeof import('react')
    const { Text } = jest.requireActual('react-native') as typeof import('react-native')
    return ReactModule.createElement(Text, props, children)
  },
}))

jest.mock('@/components/Row', () => ({
  Row: ({ children }: { children: ReactNode }) => {
    const ReactModule = jest.requireActual('react') as typeof import('react')
    const { View } = jest.requireActual('react-native') as typeof import('react-native')
    return ReactModule.createElement(View, null, children)
  },
}))

jest.mock('@/components/TouchableIcons', () => ({
  Add: ({ action, accessibilityLabel }: { action?: () => void; accessibilityLabel?: string }) => {
    const ReactModule = jest.requireActual('react') as typeof import('react')
    const { Text, TouchableOpacity } = jest.requireActual('react-native') as typeof import('react-native')
    return ReactModule.createElement(
      TouchableOpacity,
      { onPress: action, accessibilityRole: 'button', accessibilityLabel },
      ReactModule.createElement(Text, null, 'Add'),
    )
  },
  Delete: ({ action, accessibilityLabel, accessibilityHint }: { action?: () => void; accessibilityLabel?: string; accessibilityHint?: string }) => {
    const ReactModule = jest.requireActual('react') as typeof import('react')
    const { Text, TouchableOpacity } = jest.requireActual('react-native') as typeof import('react-native')
    return ReactModule.createElement(
      TouchableOpacity,
      { onPress: action, accessibilityRole: 'button', accessibilityLabel, accessibilityHint },
      ReactModule.createElement(Text, null, 'Delete'),
    )
  },
}))

function setListIdParam(listId: string) {
  ; (useLocalSearchParams as jest.Mock).mockReturnValue({ listId })
}

describe('ListReminders screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    capturedAlertCallback = null

    mockCartStore = createCartStoreMock({
      lists: [{ id: 'list-1', name: 'Mercado', products: [] }],
    })

    mockReminderStore = createReminderStoreMock([
      makeReminder({ id: 'r1', title: 'Leite', listId: 'list-1', datetimeISO: '2099-01-10T10:00:00.000Z' }),
      makeReminder({ id: 'r2', title: 'Pao', listId: 'list-1', datetimeISO: '2099-01-01T08:00:00.000Z' }),
    ])

    setListIdParam('list-1')
      ; (ReminderOrchestrator.removeReminder as jest.Mock).mockResolvedValue(undefined)
      ; (ReminderService.getStatus as jest.Mock).mockReturnValue('Ativo')
  })

  it('renderiza fallback quando lista nao existe e volta para listas', async () => {
    setListIdParam('list-inexistente')

    const { getByText, getByRole } = await render(<ListReminders />)

    expect(getByText(REMINDERS.invalid_list).props.accessibilityLiveRegion).toBe('assertive')
    await fireEvent.press(getByRole('button', { name: 'Voltar para as listas' }))
    expect(mockPush).toHaveBeenCalledWith('/lists')
  })

  it('anuncia o estado vazio quando a lista não possui lembretes', async () => {
    mockReminderStore = createReminderStoreMock([])
    const { getByText } = await render(<ListReminders />)

    expect(getByText(REMINDERS.empty_list).props.accessibilityLiveRegion).toBe('polite')
  })

  it('renderiza lembretes da lista e navega para novo lembrete', async () => {
    const { getByText, getByRole } = await render(<ListReminders />)

    expect(getByText('Pao')).toBeTruthy()
    expect(getByText('Leite')).toBeTruthy()

    await fireEvent.press(getByRole('button', { name: 'Adicionar lembrete para Mercado' }))
    expect(mockPush).toHaveBeenCalledWith('/reminders/list-1/new')
  })

  it('navega para edição e remove o lembrete após confirmação', async () => {
    const { getByRole } = await render(<ListReminders />)

    const editButton = getByRole('button', { name: 'Editar lembrete Pao, 2099-01-01T08:00:00.000Z, Ativo' })
    expect(editButton).toBeTruthy()
    await fireEvent.press(editButton)
    expect(mockPush).toHaveBeenCalledWith('/reminders/list-1/edit/r2')

    const removeButton = getByRole('button', { name: 'Remover lembrete Pao' })
    expect(removeButton.props.accessibilityHint).toBe('Remove este lembrete')
    await fireEvent.press(removeButton)

    expect(capturedAlertCallback).toBeTruthy()
    if (capturedAlertCallback) {
      await capturedAlertCallback()
      expect(ReminderOrchestrator.removeReminder).toHaveBeenCalledWith('r2')
    }
  })
})
