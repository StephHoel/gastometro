import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import { ListItem } from '@/components/List/ListItem'

describe('ListItem accessibility', () => {
  const product = {
    id: 'product-1',
    item: 'Arroz',
    quantity: '2',
    price: '10,00',
    collected: false,
  }

  it('exposes contextual names for remove, collect and edit actions', async () => {
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

    expect(getByRole('button', { name: 'Remover Arroz' })).toBeTruthy()
    expect(getByRole('checkbox', { name: 'Marcar Arroz como coletado' })).toBeTruthy()
    expect(getByRole('button', { name: 'Editar Arroz' })).toBeTruthy()
  })

  it('announces the collected state and toggles it when activated', async () => {
    const onToggle = jest.fn()
    const { getByRole, rerender } = await render(
      <ListItem
        product={product}
        index={0}
        totalCount={1}
        onDelete={jest.fn()}
        onToggle={onToggle}
        onEdit={jest.fn()}
      />,
    )

    fireEvent.press(getByRole('checkbox', { name: 'Marcar Arroz como coletado' }))
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

    expect(getByRole('checkbox', { name: 'Desmarcar Arroz como coletado' }).props.accessibilityState).toEqual({ checked: true })
  })
})
