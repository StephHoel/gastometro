import React from 'react'
import { render } from '@testing-library/react-native'
import PriceComparison from '@/app/(tabs)/price-comparison'
import { usePriceComparisonStore } from '@/stores/PriceComparisonStore'

describe('Acessibilidade da comparação de preços', () => {
  beforeEach(() => {
    usePriceComparisonStore.setState({
      places: [{ id: 'market-a11y', name: 'Mercado Central' }],
      entries: [{
        id: 'entry-a11y',
        itemName: 'Arroz',
        quantityReference: '1 kg',
        pricesByPlace: [{ placeId: 'market-a11y', price: '8,00' }],
        createdAt: '',
        updatedAt: '',
      }],
    })
  })

  it('expõe cabeçalhos e ações com contexto do lugar e do item', async () => {
    const screen = await render(<PriceComparison />)

    expect(screen.getByRole('header', { name: 'Lugares Cadastrados' })).toBeTruthy()
    expect(screen.getByRole('header', { name: 'Itens para Comparar' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Editar lugar Mercado Central' }).props.accessibilityHint).toBe(
      'Abre o formulário de edição do lugar',
    )
    expect(screen.getByRole('button', { name: 'Remover lugar Mercado Central' }).props.accessibilityHint).toBe(
      'Remove este lugar e os preços associados',
    )
    expect(screen.getByRole('button', { name: 'Editar comparação de Arroz' }).props.accessibilityHint).toBe(
      'Abre o formulário para editar os preços deste item',
    )
    expect(screen.getByRole('button', { name: 'Remover comparação de Arroz' }).props.accessibilityHint).toBe(
      'Remove este item e seus preços associados',
    )
  })
})
