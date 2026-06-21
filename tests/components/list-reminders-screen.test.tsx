import React, { forwardRef, ReactNode } from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import ListReminders from '@/app/reminders/[listId]/index'
import { ERROR } from '@/constants/text/error'
import { REMINDERS } from '@/constants/text/reminders'
import { AlertService } from '@/services/AlertService'
import { ReminderOrchestrator } from '@/services/ReminderOrchestrator'
import { ReminderService } from '@/services/ReminderService'
import { useLocalSearchParams } from 'expo-router'
import { createCartStoreMock, createReminderStoreMock, makeReminder } from '../setup/helpers/reminder-test-factories'
import { mockPush } from '../setup/mocks/expo-router'
import { Text } from 'react-native'

const mockShowAlert = jest.fn()

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

jest.mock('@/services/AlertService', () => ({
  AlertService: {
    ok: jest.fn(),
  },
}))

jest.mock('@/services/ReminderOrchestrator', () => ({
  ReminderOrchestrator: {
    rescheduleReminder: jest.fn(),
    enableReminder: jest.fn(),
    disableReminder: jest.fn(),
    removeReminder: jest.fn(),
  },
}))

jest.mock('@/services/ReminderService', () => ({
  ReminderService: {
    fromDateAndTime: jest.fn(),
    validateCreateInput: jest.fn(),
    validateUpdateInput: jest.fn(),
    toDateInputValue: jest.fn(() => ({ date: '2099-01-01', time: '10:00' })),
    isOverdue: jest.fn(() => false),
  },
}))

jest.mock('@/utils/functions/DateFunctions', () => ({
  makeDefaultDateTime: jest.fn(() => ({ date: '2099-01-01', time: '10:00' })),
  toDisplayDate: jest.fn((value: string) => value),
}))

jest.mock('@/components/Header', () => ({ Header: () => null }))

jest.mock('@/components/Screen', () => {
  return {
    Screen: forwardRef(({ children }: { children: ReactNode }, ref: unknown) => {
      return children
    }),
  }
})

jest.mock('@/components/Row', () => {
  return {
    Row: forwardRef(({ children }: { children: ReactNode }, ref: unknown) => {
      return children
    }),
  }
})

jest.mock('@/components/TextWhite', () => ({
  TextWhite: ({ children }: { children: ReactNode }) => {
    return <Text>{children}</Text>
  },
}))

jest.mock('@/components/CustomAlert', () => {
  const { forwardRef } = require('react')
  return {
    CustomAlert: forwardRef((_props: unknown, ref: { current?: { showAlert: typeof mockShowAlert } }) => {
      if (ref && typeof ref === 'object') {
        ref.current = { showAlert: mockShowAlert }
      }
      return null
    }),
  }
})

function setListIdParam(listId: string) {
  ; (useLocalSearchParams as jest.Mock).mockReturnValue({ listId })
}

describe('ListReminders screen', () => {
  const alertOk = AlertService.ok as jest.Mock
  const fromDateAndTime = ReminderService.fromDateAndTime as jest.Mock
  const validateCreateInput = ReminderService.validateCreateInput as jest.Mock
  const validateUpdateInput = ReminderService.validateUpdateInput as jest.Mock
  const enableReminder = ReminderOrchestrator.enableReminder as jest.Mock
  const disableReminder = ReminderOrchestrator.disableReminder as jest.Mock
  const removeReminder = ReminderOrchestrator.removeReminder as jest.Mock
  const rescheduleReminder = ReminderOrchestrator.rescheduleReminder as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    mockCartStore = createCartStoreMock({
      lists: [{ id: 'list-1', name: 'Mercado', products: [] }],
    })

    mockReminderStore = createReminderStoreMock([
      makeReminder({ id: 'r1', title: 'Leite', listId: 'list-1', enabled: false, notificationId: undefined }),
      makeReminder({ id: 'r2', title: 'Pão', listId: 'list-1', enabled: true, notificationId: 'n2' }),
    ])

    setListIdParam('list-1')
    fromDateAndTime.mockReturnValue('2099-01-10T10:00:00.000Z')
    validateCreateInput.mockReturnValue(null)
    validateUpdateInput.mockReturnValue(null)
    enableReminder.mockResolvedValue('enabled')
    disableReminder.mockResolvedValue(undefined)
    removeReminder.mockResolvedValue(undefined)
    rescheduleReminder.mockResolvedValue(undefined)
  })

  it('renderiza fallback quando lista não existe e volta para listas', () => {
    setListIdParam('list-inexistente')

    const { getByText } = render(<ListReminders />)

    expect(getByText(REMINDERS.invalid_list)).toBeTruthy()
    fireEvent.press(getByText(REMINDERS.back_to_lists))
    expect(mockPush).toHaveBeenCalledWith('/lists')
  })

  it('valida data inválida na criação e chama addReminder quando válido', () => {
    const { getByText, getByPlaceholderText } = render(<ListReminders />)

    fromDateAndTime.mockReturnValueOnce(null)
    fireEvent.press(getByText(REMINDERS.button.create))
    expect(alertOk).toHaveBeenCalledWith(ERROR.alert_title, ERROR.reminder.invalid_datetime)

    fireEvent.changeText(getByPlaceholderText(REMINDERS.placeholder.title), 'Comprar frutas')
    fireEvent.changeText(getByPlaceholderText(REMINDERS.placeholder.date), '2099-01-11')
    fireEvent.changeText(getByPlaceholderText(REMINDERS.placeholder.time), '11:30')
    fireEvent.press(getByText(REMINDERS.button.create))

    expect(mockReminderStore.addReminder).toHaveBeenCalledWith({
      title: 'Comprar frutas',
      datetimeISO: '2099-01-10T10:00:00.000Z',
      listId: 'list-1',
    })
  })

  it('cobre fluxo de edição com erro de validação e com update não encontrado', () => {
    const { getAllByText, getByText } = render(<ListReminders />)

    fireEvent.press(getAllByText(REMINDERS.edit_button)[0])

    validateUpdateInput.mockReturnValueOnce('erro-validacao')
    fireEvent.press(getByText(REMINDERS.button.update))
    expect(alertOk).toHaveBeenCalledWith(ERROR.alert_title, 'erro-validacao')

      ; (mockReminderStore.updateReminder as jest.Mock).mockReturnValueOnce(null)
    fireEvent.press(getByText(REMINDERS.button.update))
    expect(alertOk).toHaveBeenCalledWith(ERROR.alert_title, REMINDERS.not_found)
  })

  it('toggle lembrete cobre no-permission e disable', async () => {
    const { getAllByText } = render(<ListReminders />)

    enableReminder.mockResolvedValueOnce('no-permission')
    fireEvent.press(getAllByText(REMINDERS.enable_button)[0])

    await Promise.resolve()
    expect(alertOk).toHaveBeenCalledWith(REMINDERS.permission_title, REMINDERS.permission_denied_message)

    fireEvent.press(getAllByText(REMINDERS.disable_button)[0])
    await Promise.resolve()
    expect(disableReminder).toHaveBeenCalledWith('r2')
  })

  it('remove lembrete via confirmação do CustomAlert', async () => {
    const { getAllByText } = render(<ListReminders />)

    fireEvent.press(getAllByText(REMINDERS.remove_button)[0])
    const payload = mockShowAlert.mock.calls[0][0] as {
      buttons: Array<{ action: () => Promise<void> }>
    }

    await payload.buttons[0].action()
    expect(removeReminder).toHaveBeenCalledWith('r1')
  })
})
