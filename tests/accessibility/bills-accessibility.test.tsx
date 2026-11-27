import React from 'react'
import { render } from '@testing-library/react-native'
import Bills from '@/app/(tabs)/bills'
import { useBillStore } from '@/stores/BillStore'

const mockShowAlert = jest.fn()

jest.mock('@/hooks/useInitAlert', () => ({
  useInitAlert: (ref: { current: unknown }) => {
    ref.current = { showAlert: mockShowAlert }
  },
}))

jest.mock('@/components/Page', () => ({
  Page: ({ children }: { children: React.ReactNode }) => children,
}))

jest.mock('@/services/AlertService', () => ({
  AlertService: { ok: jest.fn() },
}))

describe('Acessibilidade de contas', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useBillStore.setState({ bills: [{ id: 'bill-a11y', title: 'Internet', amount: '99.90', paid: false }] })
  })

  it('expõe campos nomeados, ações contextuais e estado de pagamento', async () => {
    const screen = await render(<Bills />)

    expect(screen.getByLabelText('Nome da conta')).toBeTruthy()
    expect(screen.getByLabelText('Valor da conta')).toBeTruthy()
    expect(screen.getByLabelText('Data de vencimento').props.accessibilityHint).toBe(
      'Informe a data no formato ano, mês e dia',
    )

    const checkbox = screen.getByRole('checkbox', { name: 'Marcar conta Internet como paga' })
    expect(checkbox.props.accessibilityState).toEqual({ checked: false })
    expect(checkbox.props.accessibilityHint).toBe('Alterna o status de pagamento desta conta')
    expect(screen.getByRole('button', { name: 'Editar conta Internet' }).props.accessibilityHint).toBe(
      'Abre o formulário para alterar esta conta',
    )
    expect(screen.getByRole('button', { name: 'Remover conta Internet' }).props.accessibilityHint).toBe(
      'Abre a confirmação para remover esta conta',
    )
  })
})
