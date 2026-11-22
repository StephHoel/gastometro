import React from 'react'
import { Text, View } from 'react-native'
import { fireEvent, render } from '@testing-library/react-native'
import Bills from '@/app/bills'
import { useBillStore } from '@/stores/BillStore'
import { AlertService } from '@/services/AlertService'

const mockShowAlert = jest.fn()

jest.mock('@/hooks/useInitAlert', () => ({
  useInitAlert: (ref: { current: unknown }) => {
    ref.current = { showAlert: mockShowAlert }
  },
}))

jest.mock('@/components/Page', () => ({
  Page: ({ children }: { children: React.ReactNode }) => {
    const ReactModule = jest.requireActual('react') as typeof import('react')
    const { View: NativeView } = jest.requireActual('react-native') as typeof import('react-native')
    return ReactModule.createElement(NativeView, null, children)
  },
}))

jest.mock('@/services/AlertService', () => ({
  AlertService: { ok: jest.fn() },
}))

describe('Bills screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useBillStore.setState({ bills: [] })
  })

  it('mostra estado vazio e valida campos obrigatórios e valores inválidos', async () => {
    const screen = await render(<Bills />)
    expect(screen.getByText('Nenhuma conta cadastrada.')).toBeTruthy()

    fireEvent.press(screen.getByText('Adicionar conta'))
    expect(AlertService.ok).toHaveBeenCalledWith('Conta inválida', expect.any(String))

    fireEvent.changeText(screen.getByLabelText('Nome da conta'), 'Energia')
    fireEvent.changeText(screen.getByLabelText('Valor da conta'), '-10')
    fireEvent.press(screen.getByText('Adicionar conta'))
    expect(AlertService.ok).toHaveBeenLastCalledWith('Conta inválida', expect.any(String))
    expect(useBillStore.getState().bills).toHaveLength(0)
  })

  it('cadastra, edita, cancela edição e alterna status de pagamento', () => {
    const screen = await render(<Bills />)
    fireEvent.changeText(screen.getByLabelText('Nome da conta'), 'Internet')
    fireEvent.changeText(screen.getByLabelText('Valor da conta'), '99,90')
    fireEvent.changeText(screen.getByLabelText('Data de vencimento'), '2099-12-31')
    fireEvent.press(screen.getByText('Adicionar conta'))

    expect(useBillStore.getState().bills).toHaveLength(1)
    expect(screen.getByText('Internet')).toBeTruthy()
    expect(screen.getByText('Total pendente')).toBeTruthy()

    fireEvent.press(screen.getByLabelText('Editar conta Internet'))
    expect(screen.getByText('Editar conta')).toBeTruthy()
    fireEvent.changeText(screen.getByLabelText('Nome da conta'), 'Internet fibra')
    fireEvent.press(screen.getByText('Salvar alterações'))
    expect(useBillStore.getState().bills[0].title).toBe('Internet fibra')

    fireEvent.press(screen.getByLabelText('Marcar como paga'))
    expect(useBillStore.getState().bills[0].paid).toBe(true)
    expect(screen.getByText('Total pago')).toBeTruthy()

    fireEvent.press(screen.getByLabelText('Editar conta Internet fibra'))
    fireEvent.press(screen.getByText('Cancelar edição'))
    expect(screen.getByText('Nova conta')).toBeTruthy()
  })

  it('confirma remoção e executa a ação selecionada', async () => {
    useBillStore.setState({
      bills: [{ id: 'bill-1', title: 'Água', amount: '50', paid: false }],
    })
    const screen = await render(<Bills />)

    fireEvent.press(screen.getByLabelText('Remover Água'))
    expect(mockShowAlert).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Remover conta',
      message: 'Deseja remover "Água"?',
    }))
    const alert = mockShowAlert.mock.calls[0][0] as { buttons: Array<{ action: () => void }> }
    alert.buttons[0].action()
    expect(useBillStore.getState().bills).toHaveLength(0)
  })
})
