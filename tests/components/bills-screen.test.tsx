import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import Bills from '@/app/(tabs)/bills'
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

    await fireEvent.press(screen.getByText('Adicionar conta'))
    expect(AlertService.ok).toHaveBeenCalledWith('Conta inválida', expect.any(String))

    await fireEvent.changeText(screen.getByLabelText('Nome da conta'), 'Energia')
    await fireEvent.changeText(screen.getByLabelText('Valor da conta'), '-10')
    await fireEvent.press(screen.getByText('Adicionar conta'))
    expect(AlertService.ok).toHaveBeenLastCalledWith('Conta inválida', expect.any(String))
    expect(useBillStore.getState().bills).toHaveLength(0)
  })

  it('cadastra, edita, cancela edição e alterna status de pagamento', async () => {
    const screen = await render(<Bills />)
    await fireEvent.changeText(screen.getByLabelText('Nome da conta'), 'Internet')
    await fireEvent.changeText(screen.getByLabelText('Valor da conta'), '99,90')
    await fireEvent.changeText(screen.getByLabelText('Data de vencimento'), '2099-12-31')
    await fireEvent.press(screen.getByText('Adicionar conta'))

    expect(useBillStore.getState().bills).toHaveLength(1)
    expect(screen.getByText('Internet')).toBeTruthy()
    expect(screen.getByText('Total pendente')).toBeTruthy()
    expect(screen.getByLabelText('Data de vencimento').props.accessibilityHint).toBe(
      'Informe a data no formato ano, mês e dia',
    )

    const editButton = screen.getByRole('button', { name: 'Editar conta Internet' })
    expect(editButton.props.accessibilityHint).toBe('Abre o formulário para alterar esta conta')
    await fireEvent.press(editButton)
    expect(screen.getByText('Editar conta')).toBeTruthy()
    await fireEvent.changeText(screen.getByLabelText('Nome da conta'), 'Internet fibra')
    await fireEvent.press(screen.getByText('Salvar alterações'))
    expect(useBillStore.getState().bills[0].title).toBe('Internet fibra')

    const payCheckbox = screen.getByRole('checkbox', { name: 'Marcar conta Internet fibra como paga' })
    expect(payCheckbox.props.accessibilityState).toEqual({ checked: false })
    expect(payCheckbox.props.accessibilityHint).toBe('Alterna o status de pagamento desta conta')
    await fireEvent.press(payCheckbox)
    expect(useBillStore.getState().bills[0].paid).toBe(true)
    expect(screen.getByRole('checkbox', { name: 'Marcar conta Internet fibra como pendente' }).props.accessibilityState).toEqual({ checked: true })
    expect(screen.getByText('Total pago')).toBeTruthy()

    await fireEvent.press(screen.getByLabelText('Editar conta Internet fibra'))
    await fireEvent.press(screen.getByText('Cancelar edição'))
    expect(screen.getByText('Nova conta')).toBeTruthy()
  })

  it('confirma remoção e executa a ação selecionada', async () => {
    useBillStore.setState({
      bills: [{ id: 'bill-1', title: 'Água', amount: '50', paid: false }],
    })
    const screen = await render(<Bills />)

    const removeButton = screen.getByRole('button', { name: 'Remover conta Água' })
    expect(removeButton.props.accessibilityHint).toBe('Abre a confirmação para remover esta conta')
    await fireEvent.press(removeButton)
    expect(mockShowAlert).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Remover conta',
      message: 'Deseja remover "Água"?',
    }))
    const alert = mockShowAlert.mock.calls[0][0] as { buttons: Array<{ action: () => void }> }
    alert.buttons[0].action()
    expect(useBillStore.getState().bills).toHaveLength(0)
  })
  it('distingue contas vencidas e sem vencimento e alterna o pagamento', async () => {
    useBillStore.setState({
      bills: [
        { id: 'late', title: 'Aluguel', amount: '1500', paid: false, dueDate: '2000-01-01' },
        { id: 'no-date', title: 'Assinatura', amount: '20', paid: false },
      ],
    })
    const screen = await render(<Bills />)

    expect(screen.getByText(/Vencida/)).toBeTruthy()
    expect(screen.getByText('Assinatura')).toBeTruthy()
    expect(screen.getAllByText(/Vencimento:/)).toHaveLength(1)

    await fireEvent.press(screen.getByLabelText('Marcar conta Aluguel como paga'))
    expect(screen.getByLabelText('Marcar conta Aluguel como pendente')).toBeTruthy()
    await fireEvent.press(screen.getByLabelText('Marcar conta Aluguel como pendente'))
    expect(screen.getByLabelText('Marcar conta Aluguel como paga')).toBeTruthy()
  })

})
