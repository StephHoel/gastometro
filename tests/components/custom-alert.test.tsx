import React, { createRef } from 'react'
import { act, fireEvent, render } from '@testing-library/react-native'
import { CustomAlert } from '@/components/CustomAlert'
import type { CustomAlertRef } from '@/interfaces/CustomAlertRef'

describe('CustomAlert', () => {
  it('deve exibir título, mensagem e botão cancelar quando há múltiplas ações', async () => {
    const ref = createRef<CustomAlertRef>()
    const { getByText } = await render(<CustomAlert ref={ref} />)

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

    expect(getByText('Título')).toBeTruthy()
    expect(getByText('Mensagem')).toBeTruthy()
    expect(getByText('Cancelar')).toBeTruthy()
  })

  it('deve manter um único botão OK sem adicionar cancelar', async () => {
    const ref = createRef<CustomAlertRef>()
    const { getByText, queryByText } = await render(<CustomAlert ref={ref} />)

    const action = jest.fn()
    await act(() => {
      ref.current?.showAlert({
        title: 'Título',
        message: 'Mensagem',
        buttons: [{ text: 'OK', action }],
      })
    })

    await fireEvent.press(getByText('OK'))

    expect(action).toHaveBeenCalledTimes(1)
    expect(queryByText('Cancelar')).toBeNull()
  })
})
