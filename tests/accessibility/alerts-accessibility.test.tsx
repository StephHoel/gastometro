import React, { createRef } from 'react'
import { act, fireEvent, render } from '@testing-library/react-native'
import { Modal } from 'react-native'
import { CustomAlert } from '@/components/CustomAlert'
import type { CustomAlertRef } from '@/interfaces/CustomAlertRef'

describe('Acessibilidade de alertas e diálogos', () => {
  it('expõe mensagem como alerta e mantém o diálogo modal para tecnologias assistivas', async () => {
    const alertRef = createRef<CustomAlertRef>()
    const screen = await render(<CustomAlert ref={alertRef} />)

    await act(() => {
      alertRef.current?.showAlert({
        title: 'Remover conta',
        message: 'Deseja remover Internet?',
        buttons: [{ text: 'Remover', action: jest.fn() }],
      })
    })

    expect(screen.getByText('Remover conta').props.accessibilityRole).toBe('header')
    expect(screen.getByText('Deseja remover Internet?').props.accessibilityRole).toBe('alert')
    expect(screen.getByText('Deseja remover Internet?').props.accessibilityLiveRegion).toBe('assertive')
    expect(screen.UNSAFE_getByType(Modal).props.accessibilityViewIsModal).toBe(true)
  })

  it('oferece ações com nomes claros e executa confirmação uma única vez', async () => {
    const alertRef = createRef<CustomAlertRef>()
    const confirm = jest.fn()
    const screen = await render(<CustomAlert ref={alertRef} />)

    await act(() => {
      alertRef.current?.showAlert({
        title: 'Excluir lista',
        message: 'Deseja excluir a lista Compras?',
        buttons: [{ text: 'Excluir lista Compras', action: confirm }],
      })
    })

    const confirmButton = screen.getByRole('button', { name: 'Excluir lista Compras' })
    const cancelButton = screen.getByRole('button', { name: 'Cancelar' })

    await fireEvent.press(confirmButton)
    expect(confirm).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('Deseja excluir a lista Compras?')).toBeNull()
    expect(cancelButton).toBeTruthy()
  })

  it('não adiciona uma ação de cancelamento redundante ao alerta informativo', async () => {
    const alertRef = createRef<CustomAlertRef>()
    const screen = await render(<CustomAlert ref={alertRef} />)

    await act(() => {
      alertRef.current?.showAlert({
        title: 'Operação concluída',
        message: 'A lista foi salva.',
        buttons: [{ text: 'OK', action: jest.fn() }],
      })
    })

    expect(screen.getByRole('button', { name: 'OK' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Cancelar' })).toBeNull()
  })
})
