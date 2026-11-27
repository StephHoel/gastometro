import React, { createRef } from 'react'
import { act, fireEvent, render } from '@testing-library/react-native'
import { CustomAlert } from '@/components/CustomAlert'
import type { CustomAlertRef } from '@/interfaces/CustomAlertRef'

describe('CustomAlert', () => {
  it('deve exibir título, mensagem e botões com nomes acessíveis quando há múltiplas ações', async () => {
    const ref = createRef<CustomAlertRef>()
    const { getByText, getByRole } = await render(<CustomAlert ref={ref} />)

    await act(() => {
      ref.current?.showAlert({
        title: 'Título',
        message: 'Mensagem',
        buttons: [
          { text: 'OK', action: jest.fn() },
          { text: 'Outra ação', action: jest.fn() },
        ],
      })
    })

    expect(getByText('Título').props.accessibilityRole).toBe('header')
    expect(getByText('Mensagem').props.accessibilityLiveRegion).toBe('assertive')
    expect(getByText('Cancelar')).toBeTruthy()
    expect(getByRole('button', { name: 'OK' })).toBeTruthy()
    expect(getByRole('button', { name: 'Outra ação' })).toBeTruthy()
    expect(getByRole('button', { name: 'Cancelar' })).toBeTruthy()
  })

  it('deve manter um único botão OK sem adicionar cancelar', async () => {
    const ref = createRef<CustomAlertRef>()
    const { getByRole, queryByText } = await render(<CustomAlert ref={ref} />)

    const action = jest.fn()
    await act(() => {
      ref.current?.showAlert({
        title: 'Título',
        message: 'Mensagem',
        buttons: [{ text: 'OK', action }],
      })
    })

    await fireEvent.press(getByRole('button', { name: 'OK' }))

    expect(action).toHaveBeenCalledTimes(1)
    expect(queryByText('Cancelar')).toBeNull()
  })
})
