import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'

import { CustomButton } from '@/components/Button'
import { Delete } from '@/components/TouchableIcons'
import { ListItem } from '@/components/List/ListItem'
import Calculator from '@/app/(tabs)/calculator'

jest.mock('@/components/Header', () => ({ Header: () => null }))

describe('Auditoria de acessibilidade dos fluxos críticos', () => {
  it('expõe papel, nome e dica nos botões reutilizáveis', async () => {
    const action = jest.fn()
    const { getByRole } = await render(
      <>
        <CustomButton accessibilityLabel="Salvar lista" accessibilityHint="Salva as alterações da lista" onPress={action}>
          <CustomButton.Text>Salvar</CustomButton.Text>
        </CustomButton>
        <Delete action={action} accessibilityLabel="Remover arroz da lista Compras" accessibilityHint="Remove o produto Arroz da lista Compras" />
      </>,
    )

    const save = getByRole('button', { name: 'Salvar lista' })
    const remove = getByRole('button', { name: 'Remover arroz da lista Compras' })

    expect(save.props.accessibilityRole).toBe('button')
    expect(save.props.accessibilityHint).toBe('Salva as alterações da lista')
    expect(remove.props.accessibilityRole).toBe('button')
    expect(remove.props.accessibilityHint).toBe('Remove o produto Arroz da lista Compras')
    await fireEvent.press(save)
    await fireEvent.press(remove)
    expect(action).toHaveBeenCalledTimes(2)
  })

  it('expõe o estado atual do checkbox de coleta e seu contexto', async () => {
    const product = { id: 'product-a11y', item: 'Arroz', quantity: '2', price: '10,00', collected: false }
    const { getByRole, rerender } = await render(
      <ListItem product={product} index={0} totalCount={1} onDelete={jest.fn()} onToggle={jest.fn()} onEdit={jest.fn()} />,
    )

    const unchecked = getByRole('checkbox', { name: 'Marcar Arroz como coletado' })
    expect(unchecked.props.accessibilityState).toEqual({ checked: false })

    await rerender(
      <ListItem product={{ ...product, collected: true }} index={0} totalCount={1} onDelete={jest.fn()} onToggle={jest.fn()} onEdit={jest.fn()} />,
    )

    const checked = getByRole('checkbox', { name: 'Desmarcar Arroz como coletado' })
    expect(checked.props.accessibilityState).toEqual({ checked: true })
  })

  it('identifica os campos, ações e anúncio de resultado da calculadora', async () => {
    const { getByLabelText, getByRole, getByText } = await render(<Calculator />)
    const price = getByLabelText('Preço da embalagem')
    const quantity = getByLabelText('Quantidade de unidades')

    expect(price.props.accessibilityHint).toBe('Informe o preço total da embalagem')
    expect(quantity.props.accessibilityHint).toBe('Informe quantas unidades há na embalagem')
    expect(getByRole('button', { name: 'Limpar campos da calculadora' })).toBeTruthy()
    expect(getByRole('button', { name: 'Calcular preço por unidade' })).toBeTruthy()

    await fireEvent.changeText(price, '12,00')
    await fireEvent.changeText(quantity, '3')
    await fireEvent.press(getByRole('button', { name: 'Calcular preço por unidade' }))
    expect(getByText(/Preço por Unidade:\\s*R\\$\\s*4,00/).props.accessibilityLiveRegion).toBe('polite')
  })
})
