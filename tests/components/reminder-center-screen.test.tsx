import React, { forwardRef, ReactNode } from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import ReminderCenter from '@/app/reminders'
import { REMINDERS } from '@/constants/text/reminders'
import { createCartStoreMock, createReminderStoreMock, makeReminder } from '../setup/helpers/reminder-test-factories'
import { mockPush } from '../setup/mocks/expo-router'

let mockCartStore = createCartStoreMock()
let mockReminderStore = createReminderStoreMock()

jest.mock('@/stores/CartStore', () => ({
  useCartStore: () => mockCartStore,
}))

jest.mock('@/stores/ReminderStore', () => ({
  useReminderStore: () => mockReminderStore,
}))

jest.mock('@/components/Header', () => ({
  Header: () => null,
}))

jest.mock('@/components/Screen', () => ({
  Screen: ({ children }: { children: ReactNode }) => children,
}))

jest.mock('@/components/Row', () => ({
  Row: ({ children }: { children: ReactNode }) => children,
}))

jest.mock('@/components/TextWhite', () => ({
  TextWhite: ({ children }: { children: ReactNode }) => {
    const React = require('react')
    const { Text } = require('react-native')
    return <Text>{children}</Text>
  },
}))

describe('ReminderCenter screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockCartStore = createCartStoreMock({
      lists: [
        { id: 'list-1', name: 'Lista A', products: [] },
        { id: 'list-2', name: 'Lista B', products: [] },
      ],
    })

    mockReminderStore = createReminderStoreMock([
      makeReminder({ id: 'r-enabled', title: 'Ativo', listId: 'list-1', enabled: true, datetimeISO: '2099-01-01T10:00:00.000Z' }),
      makeReminder({ id: 'r-disabled', title: 'Desativado', listId: 'list-1', enabled: false, datetimeISO: '2099-01-02T10:00:00.000Z' }),
      makeReminder({ id: 'r-overdue', title: 'Vencido', listId: 'list-2', enabled: true, datetimeISO: '2000-01-01T10:00:00.000Z' }),
      makeReminder({ id: 'r-unknown', title: 'Sem lista', listId: 'list-x', enabled: true, datetimeISO: '2099-01-03T10:00:00.000Z' }),
    ])
  })

  it('exibe vazio quando não há lembretes para o filtro', () => {
    mockReminderStore = createReminderStoreMock([])

    const { getByText } = render(<ReminderCenter />)

    expect(getByText(REMINDERS.center_empty)).toBeTruthy()
  })

  it('aplica filtros enabled, disabled e overdue', () => {
    const { getByText, queryByText } = render(<ReminderCenter />)

    fireEvent.press(getByText(REMINDERS.filter_label.enabled))
    expect(getByText('Ativo')).toBeTruthy()
    expect(queryByText('Desativado')).toBeNull()

    fireEvent.press(getByText(REMINDERS.filter_label.disabled))
    expect(getByText('Desativado')).toBeTruthy()
    expect(queryByText('Ativo')).toBeNull()

    fireEvent.press(getByText(REMINDERS.filter_label.overdue))
    expect(getByText('Vencido')).toBeTruthy()
    expect(queryByText('Ativo')).toBeNull()
  })

  it('mostra fallback para lista removida e navega para lista de lembretes', () => {
    const { getAllByText, getByText } = render(<ReminderCenter />)

    expect(getByText(REMINDERS.in_list(REMINDERS.unknown_list))).toBeTruthy()

    fireEvent.press(getAllByText(REMINDERS.open_list_button)[0])
    expect(mockPush).toHaveBeenCalledWith('./list-1')
  })
})
