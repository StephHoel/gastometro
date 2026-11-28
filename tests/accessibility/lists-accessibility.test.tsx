import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import Lists from '@/app/(tabs)/lists'
import { useCartStore } from '@/stores/CartStore'

const mockRouterPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}))

jest.mock('@/hooks/useInitAlert', () => ({
  useInitAlert: (ref: { current: unknown }) => {
    ref.current = { showAlert: jest.fn(), hideAlert: jest.fn() }
  },
}))

jest.mock('@/components/Page', () => ({
  Page: ({ children }: { children: React.ReactNode }) => children,
}))

jest.mock('@/stores/ReminderStore', () => ({
  useReminderStore: () => ({ getByListId: () => [] }),
}))

describe('Acessibilidade do gerenciamento de listas', () => {
  beforeEach(() => {
    mockRouterPush.mockClear()
    useCartStore.setState({
      lists: [
        { id: 'list-active', name: 'Compras', products: [] },
        { id: 'list-other', name: 'Farmácia', products: [] },
      ],
      activeListId: 'list-active',
    })
  })

  it('identifica a criação e a seleção de listas com nomes e estados acessíveis', async () => {
    const screen = await render(<Lists />)

    expect(screen.getByLabelText('Nome da nova lista').props.accessibilityHint).toBe(
      'Digite um nome para criar uma lista de compras',
    )
    expect(screen.getByRole('button', { name: 'Selecionar lista Compras' }).props.accessibilityState).toEqual({
      selected: true,
    })
    expect(screen.getByRole('button', { name: 'Selecionar lista Farmácia' }).props.accessibilityState).toEqual({
      selected: false,
    })

    await fireEvent.press(screen.getByRole('button', { name: 'Selecionar lista Farmácia' }))
    expect(useCartStore.getState().activeListId).toBe('list-other')
    expect(mockRouterPush).toHaveBeenCalledTimes(1)
  })

  it('mantém o campo e as ações acessíveis durante a renomeação', async () => {
    const screen = await render(<Lists />)

    await fireEvent.press(screen.getByRole('button', { name: 'Renomear lista Farmácia' }))
    const nameInput = screen.getByLabelText('Nome da lista Farmácia')
    expect(nameInput.props.accessibilityHint).toBe('Edite o nome e salve as alterações')

    await fireEvent.changeText(nameInput, 'Drogaria')
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar nome da lista Farmácia' }))

    expect(useCartStore.getState().lists.find((list) => list.id === 'list-other')?.name).toBe('Drogaria')
  })
})
