import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import Calculator from '@/app/(tabs)/calculator'

jest.mock('@/components/Header', () => ({
  Header: () => null,
}))

describe('Calculator accessibility', () => {
  it('exposes descriptive names and hints for its primary actions', async () => {
    const { getByRole, getByLabelText } = await render(<Calculator />)

    expect(getByLabelText('Preço da embalagem')).toBeTruthy()
    expect(getByLabelText('Quantidade de unidades')).toBeTruthy()

    const clearButton = getByRole('button', { name: 'Limpar campos da calculadora' })
    const calculateButton = getByRole('button', { name: 'Calcular preço por unidade' })

    expect(clearButton.props.accessibilityHint).toBe(
      'Apaga os valores informados e o resultado atual',
    )
    expect(calculateButton.props.accessibilityHint).toBe(
      'Divide o preço informado pela quantidade',
    )
    expect(getByLabelText('Preço da embalagem').props.accessibilityHint).toBe(
      'Informe o preço total da embalagem',
    )
    expect(getByLabelText('Quantidade de unidades').props.accessibilityHint).toBe(
      'Informe quantas unidades há na embalagem',
    )
  })
  it('calcula, anuncia o resultado e limpa os campos', async () => {
    const { getByLabelText, getByRole, getByText } = await render(<Calculator />)

    const priceInput = getByLabelText('Preço da embalagem')
    const quantityInput = getByLabelText('Quantidade de unidades')

    await fireEvent.changeText(priceInput, '10,00')
    await fireEvent.changeText(quantityInput, '2')
    await fireEvent.press(getByRole('button', { name: 'Calcular preço por unidade' }))

    const result = getByText(/Preço por Unidade:\s*R\$\s*5,00/)
    expect(result.props.accessibilityLiveRegion).toBe('polite')

    await fireEvent.press(getByRole('button', { name: 'Limpar campos da calculadora' }))

    expect(getByText('Preço por Unidade: R$ ??')).toBeTruthy()
    expect(getByLabelText('Preço da embalagem').props.value).toBe('')
    expect(getByLabelText('Quantidade de unidades').props.value).toBe('')
  })
})
