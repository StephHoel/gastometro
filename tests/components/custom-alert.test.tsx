import React, { createRef } from 'react'
import { act, fireEvent, render } from '@testing-library/react-native'
import { CustomAlert, type CustomAlertRef } from '@/components/CustomAlert'

describe('CustomAlert', () => {
  it('deve exibir título, mensagem e botão cancelar quando há múltiplas ações', () => {
    const ref = createRef<CustomAlertRef>()
    const { getByText } = render(<CustomAlert ref={ref} />)

    act(() => {
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

  it('deve manter um único botão OK sem adicionar cancelar', () => {
    const ref = createRef<CustomAlertRef>()
    const { getByText, queryByText } = render(<CustomAlert ref={ref} />)

    const action = jest.fn()
    act(() => {
      ref.current?.showAlert({
        title: 'Título',
        message: 'Mensagem',
        buttons: [{ text: 'OK', action }],
      })
    })

    fireEvent.press(getByText('OK'))

    expect(action).toHaveBeenCalledTimes(1)
    expect(queryByText('Cancelar')).toBeNull()
  })
})
