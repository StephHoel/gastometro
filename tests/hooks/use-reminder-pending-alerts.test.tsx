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

  it('exibe alerta para lembrete vencido com ações de desativar e remover', async () => {
    await render(<HookHarness />)

    expect(alertShowMock).toHaveBeenCalledTimes(1)

    const params = alertShowMock.mock.calls[0][0]

    await act(() => {
      params.buttons[0].action()
      params.buttons[1].action()
    })

    expect(disableReminderMock).toHaveBeenCalledWith('r-1')
    expect(removeReminderMock).toHaveBeenCalledWith('r-1')
  })

  it('enfileira alertas e mostra o próximo ao fechar o atual', async () => {
    applyStores([
      makeReminder({ id: 'r-1', title: 'Leite' }),
      makeReminder({ id: 'r-2', title: 'Arroz' }),
    ])

    await render(<HookHarness />)

    expect(alertShowMock).toHaveBeenCalledTimes(1)

    const firstParams = alertShowMock.mock.calls[0][0]

    await act(() => {
      firstParams.onClose()
    })

    expect(alertShowMock).toHaveBeenCalledTimes(2)
    const secondParams = alertShowMock.mock.calls[1][0]
    expect(secondParams.message).toContain('Arroz')
  })

  it('reexibe alerta ao focar Home novamente', async () => {
    await render(<HookHarness />)

    expect(alertShowMock).toHaveBeenCalledTimes(1)

    expect(focusCallback).toBeDefined()

    await act(() => {
      focusCallback?.()
    })

    expect(alertShowMock).toHaveBeenCalledTimes(2)
  })

  it('tenta novamente quando AlertService ainda não está pronto no primeiro flush', async () => {
    jest.useFakeTimers()

    alertShowMock
      .mockReturnValueOnce(false)
      .mockReturnValue(true)

    await render(<HookHarness />)

    expect(alertShowMock).toHaveBeenCalledTimes(1)

    await act(() => {
      jest.runOnlyPendingTimers()
    })

    expect(alertShowMock).toHaveBeenCalledTimes(2)

    jest.useRealTimers()
  })


  it('pula lembrete inválido da fila e tenta o próximo', async () => {
    const reminders = [
      makeReminder({ id: 'r-1', title: 'Leite' }),
      makeReminder({ id: 'r-2', title: 'Arroz' }),
    ]

    const cartState = {
      lists: [{ id: 'list-1', name: 'Mercado', products: [] }],
    }
    const reminderState = {
      reminders,
      getById: (id: string) => {
        if (id === 'r-2') return null
        return reminders.find((r) => r.id === id)
      },
    }

    cartStoreMock.mockReturnValue(cartState)
    cartStoreMock.getState.mockReturnValue(cartState)
    reminderStoreMock.mockReturnValue({ reminders })
    reminderStoreMock.getState.mockReturnValue(reminderState)

    await render(<HookHarness />)

    expect(alertShowMock).toHaveBeenCalledTimes(1)
    const params = alertShowMock.mock.calls[0][0] as { message: string }
    expect(params.message).toContain('Leite')
  })

  it('limpa IDs obsoletos de shownRef quando reminders é atualizado', async () => {
    await render(<HookHarness />)
    expect(alertShowMock).toHaveBeenCalledTimes(1)

    const emptyState = {
      reminders: [],
      getById: (_id: string) => null,
    }
    reminderStoreMock.mockReturnValue({ reminders: [] })
    reminderStoreMock.getState.mockReturnValue(emptyState)

    const { rerender } = await render(<HookHarness />)
    await rerender(<HookHarness />)

    expect(alertShowMock).toHaveBeenCalledTimes(1)
  })

  it('agenda próxima verificação para lembrete futuro', async () => {
    jest.useFakeTimers()

    const futureDate = new Date(Date.now() + 5000).toISOString()
    const futureReminder = makeReminder({ id: 'r-future', datetimeISO: futureDate })

    const cartState = {
      lists: [{ id: 'list-1', name: 'Mercado', products: [] }],
    }
    const reminderState = {
      reminders: [futureReminder],
      getById: (id: string) => (id === 'r-future' ? futureReminder : null),
    }

    cartStoreMock.mockReturnValue(cartState)
    cartStoreMock.getState.mockReturnValue(cartState)
    reminderStoreMock.mockReturnValue({ reminders: [futureReminder] })
    reminderStoreMock.getState.mockReturnValue(reminderState)

    await render(<HookHarness />)

    expect(alertShowMock).not.toHaveBeenCalled()

    await act(() => {
      jest.runAllTimers()
    })

    jest.useRealTimers()
  })

  it('cancela timeout de agendamento ao re-agendar via focus callback', async () => {
    jest.useFakeTimers()

    const futureDate = new Date(Date.now() + 5000).toISOString()
    const futureReminder = makeReminder({ id: 'r-future', datetimeISO: futureDate })

    const cartState = { lists: [{ id: 'list-1', name: 'Mercado', products: [] }] }
    const reminderState = {
      reminders: [futureReminder],
      getById: (id: string) => (id === 'r-future' ? futureReminder : null),
    }

    cartStoreMock.mockReturnValue(cartState)
    cartStoreMock.getState.mockReturnValue(cartState)
    reminderStoreMock.mockReturnValue({ reminders: [futureReminder] })
    reminderStoreMock.getState.mockReturnValue(reminderState)

    await render(<HookHarness />)

    await act(() => {
      focusCallback?.()
    })

    expect(alertShowMock).not.toHaveBeenCalled()

    jest.useRealTimers()
  })

  it('cancela retryTimeout no focus callback quando há retry pendente', async () => {
    jest.useFakeTimers()

    alertShowMock
      .mockReturnValueOnce(false)
      .mockReturnValue(true)

    await render(<HookHarness />)

    expect(alertShowMock).toHaveBeenCalledTimes(1)

    await act(() => {
      focusCallback?.()
    })

    jest.useRealTimers()
  })

  it('limpa timeouts ao desmontar o componente com lembrete futuro', async () => {
    jest.useFakeTimers()

    const futureDate = new Date(Date.now() + 5000).toISOString()
    const futureReminder = makeReminder({ id: 'r-future', datetimeISO: futureDate })

    const cartState = { lists: [{ id: 'list-1', name: 'Mercado', products: [] }] }
    const reminderState = {
      reminders: [futureReminder],
      getById: (id: string) => (id === 'r-future' ? futureReminder : null),
    }

    cartStoreMock.mockReturnValue(cartState)
    cartStoreMock.getState.mockReturnValue(cartState)
    reminderStoreMock.mockReturnValue({ reminders: [futureReminder] })
    reminderStoreMock.getState.mockReturnValue(reminderState)

    const { unmount } = await render(<HookHarness />)

    await expect(async () => await unmount()).not.toThrow()

    jest.useRealTimers()
  })

  it('limpa retryTimeout ao desmontar quando retry estava pendente', async () => {
    jest.useFakeTimers()

    alertShowMock
      .mockReturnValueOnce(false)
      .mockReturnValue(true)

    const { unmount } = await render(<HookHarness />)

    expect(alertShowMock).toHaveBeenCalledTimes(1)

    expect(async () => await unmount()).not.toThrow()

    jest.useRealTimers()
  })
})
