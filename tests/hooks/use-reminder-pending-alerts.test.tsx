import React from 'react'
import { act, render } from '@testing-library/react-native'
import { useReminderPendingAlerts } from '@/hooks/useReminderPendingAlerts'
import { useCartStore } from '@/stores/CartStore'
import { useReminderStore } from '@/stores/ReminderStore'
import { AlertService } from '@/services/AlertService'
import { ReminderOrchestrator } from '@/services/ReminderOrchestrator'
import { useFocusEffect } from 'expo-router'
import type { ReminderProps } from '@/interfaces/ReminderProps'

jest.mock('@/services/AlertService', () => ({
  AlertService: {
    show: jest.fn(),
  },
}))

jest.mock('@/services/ReminderOrchestrator', () => ({
  ReminderOrchestrator: {
    disableReminder: jest.fn(async () => undefined),
    removeReminder: jest.fn(async () => undefined),
  },
}))

jest.mock('@/stores/CartStore', () => {
  const store = Object.assign(jest.fn(), { getState: jest.fn() })
  return { useCartStore: store }
})

jest.mock('@/stores/ReminderStore', () => {
  const store = Object.assign(jest.fn(), { getState: jest.fn() })
  return { useReminderStore: store }
})

function HookHarness() {
  useReminderPendingAlerts()
  return null
}

function makeReminder(overrides: Partial<ReminderProps> = {}): ReminderProps {
  return {
    id: 'r-1',
    title: 'Comprar leite',
    datetimeISO: '2001-01-01T00:00:00.000Z',
    enabled: true,
    listId: 'list-1',
    createdAt: '2001-01-01T00:00:00.000Z',
    updatedAt: '2001-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('useReminderPendingAlerts', () => {
  const cartStoreMock = useCartStore as unknown as jest.Mock & { getState: jest.Mock }
  const reminderStoreMock = useReminderStore as unknown as jest.Mock & { getState: jest.Mock }
  const alertShowMock = AlertService.show as jest.Mock
  const disableReminderMock = ReminderOrchestrator.disableReminder as jest.Mock
  const removeReminderMock = ReminderOrchestrator.removeReminder as jest.Mock
  const focusEffectMock = useFocusEffect as jest.Mock

  let focusCallback: (() => void) | undefined

  function applyStores(reminders: ReminderProps[]) {
    const cartState = {
      lists: [{ id: 'list-1', name: 'Mercado', products: [] }],
    }

    const reminderState = {
      reminders,
      getById: (id: string) => reminders.find((reminder) => reminder.id === id),
    }

    cartStoreMock.mockReturnValue(cartState)
    cartStoreMock.getState.mockReturnValue(cartState)

    reminderStoreMock.mockReturnValue({ reminders })
    reminderStoreMock.getState.mockReturnValue(reminderState)
  }

  beforeEach(() => {
    jest.clearAllMocks()
    focusCallback = undefined

    alertShowMock.mockReturnValue(true)
    focusEffectMock.mockImplementation((callback: () => void) => {
      focusCallback = callback
    })

    applyStores([makeReminder()])
  })

  it('exibe alerta para lembrete vencido com ações de desativar e remover', () => {
    render(<HookHarness />)

    expect(alertShowMock).toHaveBeenCalledTimes(1)

    const params = alertShowMock.mock.calls[0][0]

    act(() => {
      params.buttons[0].action()
      params.buttons[1].action()
    })

    expect(disableReminderMock).toHaveBeenCalledWith('r-1')
    expect(removeReminderMock).toHaveBeenCalledWith('r-1')
  })

  it('enfileira alertas e mostra o próximo ao fechar o atual', () => {
    applyStores([
      makeReminder({ id: 'r-1', title: 'Leite' }),
      makeReminder({ id: 'r-2', title: 'Arroz' }),
    ])

    render(<HookHarness />)

    expect(alertShowMock).toHaveBeenCalledTimes(1)

    const firstParams = alertShowMock.mock.calls[0][0]

    act(() => {
      firstParams.onClose()
    })

    expect(alertShowMock).toHaveBeenCalledTimes(2)
    const secondParams = alertShowMock.mock.calls[1][0]
    expect(secondParams.message).toContain('Arroz')
  })

  it('reexibe alerta ao focar Home novamente', () => {
    render(<HookHarness />)

    expect(alertShowMock).toHaveBeenCalledTimes(1)

    expect(focusCallback).toBeDefined()

    act(() => {
      focusCallback?.()
    })

    expect(alertShowMock).toHaveBeenCalledTimes(2)
  })
})
