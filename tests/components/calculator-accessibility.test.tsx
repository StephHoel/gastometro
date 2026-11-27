import React from 'react'
import { render } from '@testing-library/react-native'
import Calculator from '@/app/(tabs)/calculator'

jest.mock('@/components/Header', () => ({
  Header: () => null,
}))

describe('Calculator accessibility', () => {
  it('exposes descriptive names and hints for its primary actions', async () => {
    const { getByRole } = await render(<Calculator />)

    const clearButton = getByRole('button', { name: 'Limpar campos da calculadora' })
    const calculateButton = getByRole('button', { name: 'Calcular preço por unidade' })

    expect(clearButton.props.accessibilityHint).toBe(
      'Apaga os valores informados e o resultado atual',
    )
    expect(calculateButton.props.accessibilityHint).toBe(
      'Divide o preço informado pela quantidade',
    )
  })
})
