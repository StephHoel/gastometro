import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import { HeaderActions } from '@/components/HeaderActions'
import { useCartStore } from '@/stores/CartStore'
import { mockPush } from '../setup/mocks/expo-router'

describe('Acessibilidade das ações do cabeçalho', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useCartStore.setState({
      products: [{ id: 'product-1', item: 'Arroz', quantity: '1', price: '10', collected: false }],
    })
  })

  it('identifica ações principais da tela inicial e navega para backup e lembretes', async () => {
    const screen = await render(<HeaderActions routeName="index" activeListId="list-1" />)

    const backup = screen.getByRole('button', { name: 'Abrir backup e restauração' })
    const reminders = screen.getByRole('button', { name: 'Abrir lembretes da lista ativa' })
    const clear = screen.getByRole('button', { name: 'Limpar itens da lista ativa' })
    const share = screen.getByRole('button', { name: 'Compartilhar lista atual' })

    expect(backup).toBeTruthy()
    expect(reminders).toBeTruthy()
    expect(clear).toBeTruthy()
    expect(share).toBeTruthy()

    await fireEvent.press(backup)
    await fireEvent.press(reminders)

    expect(mockPush).toHaveBeenNthCalledWith(1, '/backup')
    expect(mockPush).toHaveBeenNthCalledWith(2, '/reminders/list-1')
  })

  it('identifica ações de cadastro e retorno da comparação de preços', async () => {
    const screen = await render(<HeaderActions routeName="price-comparison" />)

    await fireEvent.press(screen.getByRole('button', { name: 'Cadastrar lugar' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Cadastrar item' }))

    expect(mockPush).toHaveBeenNthCalledWith(1, '/price-comparison/market/add')
    expect(mockPush).toHaveBeenNthCalledWith(2, '/price-comparison/cart/add')

    const backScreen = await render(<HeaderActions routeName="price-comparison/cart/add" />)
    const back = backScreen.getByRole('button', { name: 'Voltar para a comparação de preços' })
    await fireEvent.press(back)

    expect(mockPush).toHaveBeenLastCalledWith('/price-comparison')
  })
})
