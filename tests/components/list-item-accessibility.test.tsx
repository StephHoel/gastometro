import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import { ListItem } from '@/components/List/ListItem'

describe('Acessibilidade do item da lista', () => {
  const product = {
    id: 'product-1',
    item: 'Arroz',
    quantity: '2',
    price: '10,00',
    collected: false,
  }

  it('expõe nomes e dicas contextuais para remover, coletar e editar', async () => {
    const onDelete = jest.fn()
    const onToggle = jest.fn()
    const onEdit = jest.fn()

    const { getByRole } = await render(
      <ListItem
        product={product}
        index={0}
        totalCount={1}
        onDelete={onDelete}
        onToggle={onToggle}
        onEdit={onEdit}
      />,
    )

    const removeButton = getByRole('button', { name: 'Remover Arroz' })
    const collectCheckbox = getByRole('checkbox', { name: 'Marcar Arroz como coletado' })
    const editButton = getByRole('button', { name: 'Editar Arroz' })

    expect(removeButton.props.accessibilityHint).toBe('Remove este produto da lista')
    expect(collectCheckbox.props.accessibilityHint).toBe('Alterna o estado de coleta deste produto')
    expect(collectCheckbox.props.accessibilityState).toEqual({ checked: false })
    expect(editButton.props.accessibilityHint).toBe('Abre o formulário de edição do produto')

    await fireEvent.press(removeButton)
    await fireEvent.press(editButton)
    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  it('anuncia o estado de coleta e alterna quando ativado', async () => {
    const onToggle = jest.fn()
    const { getByLabelText, rerender } = await render(
      <ListItem
        product={product}
        index={0}
        totalCount={1}
        onDelete={jest.fn()}
        onToggle={onToggle}
        onEdit={jest.fn()}
      />,
    )

    const collectControl = getByLabelText('Marcar Arroz como coletado')
    expect(collectControl.props.accessibilityRole).toBe('checkbox')
    expect(collectControl.props.accessibilityState).toEqual({ checked: false })

    await fireEvent.press(collectControl)
    expect(onToggle).toHaveBeenCalledTimes(1)

    rerender(
      <ListItem
        product={{ ...product, collected: true }}
        index={0}
        totalCount={1}
        onDelete={jest.fn()}
        onToggle={onToggle}
        onEdit={jest.fn()}
      />,
    )

    const collectedControl = getByLabelText('Desmarcar Arroz como coletado')
    expect(collectedControl.props.accessibilityRole).toBe('checkbox')
    expect(collectedControl.props.accessibilityState).toEqual({ checked: true })
  })
})
