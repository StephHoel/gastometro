import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import PriceComparison from '@/app/(tabs)/price-comparison'
import { usePriceComparisonStore } from '@/stores/PriceComparisonStore'

describe('PriceComparison screen', () => {
  beforeEach(() => {
    usePriceComparisonStore.setState({ places: [], entries: [] })
  })

  it('exibe estados vazios sem confundir cesta vazia com total zero', async () => {
    const screen = await render(<PriceComparison />)

    expect(screen.getByText('Nenhum lugar cadastrado ainda.')).toBeTruthy()
    expect(screen.getByText('Nenhum item cadastrado ainda.')).toBeTruthy()
    expect(screen.getByText('Adicione itens e preços para comparar a cesta.')).toBeTruthy()
    expect(screen.queryByText('R$ 0,00')).toBeNull()
  })

  it('exibe ofertas, identifica melhor preço e calcula a cesta completa', async () => {
    usePriceComparisonStore.setState({
      places: [
        { id: 'a', name: 'Mercado A' },
        { id: 'b', name: 'Mercado B' },
      ],
      entries: [{
        id: 'entry-1',
        itemName: 'Arroz',
        quantityReference: '1 kg',
        pricesByPlace: [
          { placeId: 'a', price: '10,00' },
          { placeId: 'b', price: '8,00' },
        ],
        createdAt: '',
        updatedAt: '',
      }],
    })

    const screen = await render(<PriceComparison />)

    expect(screen.getByText('Arroz')).toBeTruthy()
    expect(screen.getByText('1 kg')).toBeTruthy()
    expect(screen.getByText('Mercado B · Melhor preço')).toBeTruthy()
    expect(screen.getByText('Mercado A · Maior preço')).toBeTruthy()
    expect(screen.getByText('Maior preço: Mercado A (R$ 10,00)')).toBeTruthy()
    expect(screen.getByText('Economia possível: R$ 2,00 (20,0%)')).toBeTruthy()
    expect(screen.getAllByText('Cesta completa')).toHaveLength(2)
  })

  it('marca cesta incompleta quando falta preço e alterna ordenações independentes', async () => {
    usePriceComparisonStore.setState({
      places: [
        { id: 'a', name: 'Mercado A' },
        { id: 'b', name: 'Mercado B' },
      ],
      entries: [{
        id: 'entry-1',
        itemName: 'Leite',
        pricesByPlace: [{ placeId: 'a', price: '5,50' }],
        createdAt: '',
        updatedAt: '',
      }],
    })

    const screen = await render(<PriceComparison />)

    expect(screen.getByText('Preço faltando para um ou mais itens')).toBeTruthy()
    expect(screen.getByText('Incompleta')).toBeTruthy()

    const sortButtons = screen.getAllByText(/Ordenar por/)
    await fireEvent.press(sortButtons[0])
    expect(screen.getByText('Ordenar por menor preço')).toBeTruthy()

    await fireEvent.press(screen.getByText('Ordenar por nome'))
    expect(screen.getByText('Ordenar por menor total')).toBeTruthy()
  })

  it('não apresenta diferença quando há somente uma oferta válida', async () => {
    usePriceComparisonStore.setState({
      places: [{ id: 'a', name: 'Mercado A' }],
      entries: [{
        id: 'entry-1',
        itemName: 'Café',
        pricesByPlace: [{ placeId: 'a', price: '12,50' }],
        createdAt: '',
        updatedAt: '',
      }],
    })

    const screen = await render(<PriceComparison />)

    expect(screen.getByText('Maior preço: Mercado A (R$ 12,50)')).toBeTruthy()
    expect(screen.getByText('Economia possível: Não disponível')).toBeTruthy()
  })
})
