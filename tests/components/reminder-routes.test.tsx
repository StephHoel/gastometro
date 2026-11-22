import React from 'react'
import { Text, View } from 'react-native'
import { render } from '@testing-library/react-native'
import NewReminder from '@/app/reminders/[listId]/new'
import EditReminder from '@/app/reminders/[listId]/edit/[reminderId]'

const mockFormReminder = jest.fn()

jest.mock('@/hooks/useParams', () => ({
  useListIdParam: () => 'list-123',
  useReminderIdParam: () => 'reminder-456',
}))

jest.mock('@/components/Form/Reminder', () => ({
  FormReminder: (props: Record<string, unknown>) => {
    mockFormReminder(props)
    const ReactModule = jest.requireActual('react') as typeof import('react')
    const { Text: NativeText } = jest.requireActual('react-native') as typeof import('react-native')
    return ReactModule.createElement(NativeText, null, String(props.textButton))
  },
}))

jest.mock('@/components/Page', () => ({
  Page: ({ children }: { children: React.ReactNode }) => {
    const ReactModule = jest.requireActual('react') as typeof import('react')
    const { View: NativeView } = jest.requireActual('react-native') as typeof import('react-native')
    return ReactModule.createElement(NativeView, null, children)
  },
}))

jest.mock('@/components/Icons', () => ({
  AddIcon: () => null,
  EditIcon: () => null,
}))

describe('Reminder form routes', () => {
  beforeEach(() => jest.clearAllMocks())

  it('abre o formulário de criação associado à lista', () => {
    const screen = render(<NewReminder />)
    expect(screen.getByText('Novo Lembrete')).toBeTruthy()
    expect(mockFormReminder).toHaveBeenCalledWith(expect.objectContaining({
      listId: 'list-123',
      textButton: 'Novo Lembrete',
    }))
    expect(mockFormReminder.mock.calls[0][0]).not.toHaveProperty('reminderId')
    expect(mockFormReminder.mock.calls[0][0]).not.toHaveProperty('includeDeleteButton')
  })

  it('abre o formulário de edição com identificadores e opção de exclusão', () => {
    const screen = render(<EditReminder />)
    expect(screen.getByText('Editar')).toBeTruthy()
    expect(mockFormReminder).toHaveBeenCalledWith(expect.objectContaining({
      listId: 'list-123',
      reminderId: 'reminder-456',
      textButton: 'Editar',
      includeDeleteButton: true,
    }))
  })
})
