import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react-native'
import { FormReminder } from '@/components/Form/Reminder'
import { ReminderOrchestrator } from '@/services/ReminderOrchestrator'
import { AlertService } from '@/services/AlertService'
import { useReminderStore } from '@/stores/ReminderStore'
import { useRouter } from 'expo-router'
import { REMINDERS } from '@/constants/text/reminders'

jest.mock('@/services/ReminderOrchestrator', () => ({
  ReminderOrchestrator: {
    saveReminder: jest.fn(async () => true),
    removeReminder: jest.fn(async () => undefined),
  },
}))

jest.mock('@/services/AlertService', () => ({
  AlertService: {
    removeReminder: jest.fn(),
  },
}))

jest.mock('@/utils/functions/DateFunctions', () => ({
  makeDefaultDateTime: jest.fn(() => ({ date: '2099-01-01', time: '10:00' })),
  toDateInputValue: jest.fn((iso: string) => {
    if (iso === '2099-06-15T14:30:00.000Z') return { date: '2099-06-15', time: '14:30' }
    return { date: '2099-01-01', time: '10:00' }
  }),
  formatDateInput: jest.fn((v: string) => v),
  formatTimeInput: jest.fn((v: string) => v),
}))

jest.mock('@/components/Icons', () => ({
  TrashIcon: () => null,
}))

describe('FormReminder', () => {
  const saveReminderMock = ReminderOrchestrator.saveReminder as jest.Mock
  const removeReminderMock = ReminderOrchestrator.removeReminder as jest.Mock
  const alertRemoveMock = AlertService.removeReminder as jest.Mock
  const pushMock = useRouter().push as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    useReminderStore.setState({ reminders: [] })
      ; (useRouter as jest.Mock).mockReturnValue({ push: pushMock })
    alertRemoveMock.mockImplementation((cb: () => void) => cb())
  })

  it('renderiza os campos de título, data e hora', () => {
    const { getByPlaceholderText } = render(
      <FormReminder
        listId="list-1"
        textButton="Salvar"
        iconButton={null}
      />,
    )

    expect(getByPlaceholderText(REMINDERS.placeholder.title)).toBeTruthy()
    expect(getByPlaceholderText(REMINDERS.placeholder.date)).toBeTruthy()
    expect(getByPlaceholderText(REMINDERS.placeholder.time)).toBeTruthy()
  })

  it('renderiza botão de submit com o texto correto', () => {
    const { getByText } = render(
      <FormReminder
        listId="list-1"
        textButton="Novo Lembrete"
        iconButton={null}
      />,
    )

    expect(getByText('Novo Lembrete')).toBeTruthy()
  })

  it('não exibe botão de remover quando includeDeleteButton não é passado', () => {
    const { queryByText } = render(
      <FormReminder
        listId="list-1"
        textButton="Salvar"
        iconButton={null}
      />,
    )

    expect(queryByText(REMINDERS.button.remove)).toBeNull()
  })

  it('exibe botão de remover quando includeDeleteButton é true', () => {
    const { getByText } = render(
      <FormReminder
        listId="list-1"
        reminderId="rem-1"
        textButton="Salvar"
        iconButton={null}
        includeDeleteButton
      />,
    )

    expect(getByText(REMINDERS.button.remove)).toBeTruthy()
  })

  it('chama saveReminder ao submeter o formulário', async () => {
    saveReminderMock.mockResolvedValueOnce(true)

    const { getByPlaceholderText, getByText } = render(
      <FormReminder
        listId="list-1"
        textButton="Salvar"
        iconButton={null}
      />,
    )

    fireEvent.changeText(getByPlaceholderText(REMINDERS.placeholder.title), 'Comprar leite')
    fireEvent.changeText(getByPlaceholderText(REMINDERS.placeholder.date), '2099-01-01')
    fireEvent.changeText(getByPlaceholderText(REMINDERS.placeholder.time), '10:00')

    await waitFor(() => {
      fireEvent.press(getByText('Salvar'))
    })

    expect(saveReminderMock).toHaveBeenCalledTimes(1)
    expect(saveReminderMock).toHaveBeenCalledWith(
      expect.objectContaining({ listId: 'list-1' }),
    )
  })

  it('redireciona após salvar com sucesso', async () => {
    saveReminderMock.mockResolvedValueOnce(true)

    const { getByPlaceholderText, getByText } = render(
      <FormReminder
        listId="list-1"
        textButton="Salvar"
        iconButton={null}
      />,
    )

    fireEvent.changeText(getByPlaceholderText(REMINDERS.placeholder.title), 'Título')

    await waitFor(() => {
      fireEvent.press(getByText('Salvar'))
    })

    expect(pushMock).toHaveBeenCalledWith('/reminders/list-1')
  })

  it('não redireciona quando saveReminder retorna false', async () => {
    saveReminderMock.mockResolvedValueOnce(false)

    const { getByPlaceholderText, getByText } = render(
      <FormReminder
        listId="list-1"
        textButton="Salvar"
        iconButton={null}
      />,
    )

    fireEvent.changeText(getByPlaceholderText(REMINDERS.placeholder.title), 'Título')

    await waitFor(() => {
      fireEvent.press(getByText('Salvar'))
    })

    expect(pushMock).not.toHaveBeenCalled()
  })

  it('botão de remover aciona AlertService.removeReminder', async () => {
    removeReminderMock.mockResolvedValueOnce(undefined)

    const { getByText } = render(
      <FormReminder
        listId="list-1"
        reminderId="rem-1"
        textButton="Salvar"
        iconButton={null}
        includeDeleteButton
      />,
    )

    await waitFor(() => {
      fireEvent.press(getByText(REMINDERS.button.remove))
    })

    expect(alertRemoveMock).toHaveBeenCalledTimes(1)
    expect(removeReminderMock).toHaveBeenCalledWith('rem-1')
  })

  it('preenche formulário com dados do lembrete existente via useEffect', () => {
    useReminderStore.setState({
      reminders: [
        {
          id: 'rem-1',
          title: 'Lembrete preenchido',
          datetimeISO: '2099-06-15T14:30:00.000Z',
          enabled: true,
          listId: 'list-1',
          createdAt: '2099-01-01T00:00:00.000Z',
          updatedAt: '2099-01-01T00:00:00.000Z',
        },
      ],
    })

    const { getByDisplayValue } = render(
      <FormReminder
        listId="list-1"
        reminderId="rem-1"
        textButton="Salvar"
        iconButton={null}
      />,
    )

    expect(getByDisplayValue('Lembrete preenchido')).toBeTruthy()
  })
})
