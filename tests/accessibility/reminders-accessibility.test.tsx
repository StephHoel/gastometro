import React, { type ReactNode } from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import ReminderCenter from '@/app/reminders'
import { REMINDERS } from '@/constants/text/reminders'
import { createCartStoreMock, createReminderStoreMock, makeReminder } from '../setup/helpers/reminder-test-factories'

let mockCartStore = createCartStoreMock()
let mockReminderStore = createReminderStoreMock()

jest.mock('@/stores/CartStore', () => ({ useCartStore: () => mockCartStore }))
jest.mock('@/stores/ReminderStore', () => ({ useReminderStore: () => mockReminderStore }))
jest.mock('@/components/Header', () => ({ Header: () => null }))
jest.mock('@/components/Screen', () => ({ Screen: ({ children }: { children: ReactNode }) => children }))
jest.mock('@/components/Row', () => ({ Row: ({ children }: { children: ReactNode }) => children }))

describe('Acessibilidade da central de lembretes', () => {
  beforeEach(() => {
    mockCartStore = createCartStoreMock({ lists: [{ id: 'list-a11y', name: 'Compras', products: [] }] })
    mockReminderStore = createReminderStoreMock([
      makeReminder({ id: 'reminder-a11y', title: 'Comprar café', listId: 'list-a11y', enabled: true, datetimeISO: '2099-01-01T10:00:00.000Z' }),
    ])
  })

  it('comunica filtros selecionados e contexto da ação de abrir lista', async () => {
    const screen = await render(<ReminderCenter />)
    const enabledFilter = screen.getByRole('button', { name: `Filtrar lembretes: ${REMINDERS.filter_label.enabled}` })

    expect(enabledFilter.props.accessibilityState).toEqual({ selected: false })
    await fireEvent.press(enabledFilter)
    expect(screen.getByRole('button', { name: `Filtrar lembretes: ${REMINDERS.filter_label.enabled}` }).props.accessibilityState).toEqual({ selected: true })
    expect(screen.getByRole('button', { name: 'Abrir lista Compras para o lembrete Comprar café' })).toBeTruthy()
  })
})
