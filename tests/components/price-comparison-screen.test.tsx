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

    const itemSort = screen.getByRole('button', { name: 'Ordenar itens por nome' })
    const basketSort = screen.getByRole('button', { name: 'Ordenar cesta por nome' })

    expect(itemSort.props.accessibilityHint).toBe(
      'Ordenação atual: menor preço. Ative para alternar.',
    )
    expect(basketSort.props.accessibilityHint).toBe(
      'Ordenação atual: menor total. Ative para alternar.',
    )

    await fireEvent.press(itemSort)
    expect(screen.getByRole('button', { name: 'Ordenar itens por menor preço' })).toBeTruthy()

    await fireEvent.press(screen.getByRole('button', { name: 'Ordenar cesta por nome' }))
    expect(screen.getByRole('button', { name: 'Ordenar cesta por menor total' })).toBeTruthy()
  })

  it('expõe ações contextuais de lugares, itens e ordenação', async () => {
    usePriceComparisonStore.setState({
      places: [{ id: 'a', name: 'Mercado A' }],
      entries: [{
        id: 'entry-1',
        itemName: 'Arroz',
        pricesByPlace: [{ placeId: 'a', price: '10,00' }],
        createdAt: '',
        updatedAt: '',
      }],
    })

    const screen = await render(<PriceComparison />)

    expect(screen.getByRole('header', { name: 'Lugares Cadastrados' })).toBeTruthy()
    expect(screen.getByRole('header', { name: 'Itens para Comparar' })).toBeTruthy()

    const removePlace = screen.getByRole('button', { name: 'Remover lugar Mercado A' })
    const editPlace = screen.getByRole('button', { name: 'Editar lugar Mercado A' })
    const removeEntry = screen.getByRole('button', { name: 'Remover comparação de Arroz' })
    const editEntry = screen.getByRole('button', { name: 'Editar comparação de Arroz' })

    expect(removePlace.props.accessibilityHint).toBe('Remove este lugar e os preços associados')
    expect(editPlace.props.accessibilityHint).toBe('Abre o formulário de edição do lugar')
    expect(removeEntry.props.accessibilityHint).toBe('Remove este item e seus preços associados')
    expect(editEntry.props.accessibilityHint).toBe('Abre o formulário para editar os preços deste item')

    expect(screen.getByRole('button', { name: 'Ordenar itens por nome' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Ordenar cesta por nome' })).toBeTruthy()
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

  it('identifica todos os lugares empatados no menor e no maior preço', async () => {
    usePriceComparisonStore.setState({
      places: [
        { id: 'a', name: 'Mercado A' },
        { id: 'b', name: 'Mercado B' },
        { id: 'c', name: 'Mercado C' },
        { id: 'd', name: 'Mercado D' },
      ],
      entries: [{
        id: 'entry-tie',
        itemName: 'Leite',
        pricesByPlace: [
          { placeId: 'a', price: '5,00' },
          { placeId: 'b', price: '5,00' },
          { placeId: 'c', price: '10,00' },
          { placeId: 'd', price: '10,00' },
        ],
        createdAt: '',
        updatedAt: '',
      }],
    })

    const screen = await render(<PriceComparison />)

    expect(screen.getByText('Mercado A · Melhor preço')).toBeTruthy()
    expect(screen.getByText('Mercado B · Melhor preço')).toBeTruthy()
    expect(screen.getByText('Mercado C · Maior preço')).toBeTruthy()
    expect(screen.getByText('Mercado D · Maior preço')).toBeTruthy()
    expect(screen.getByText('Maior preço: Mercado C, Mercado D (R$ 10,00)')).toBeTruthy()
    expect(screen.getByText('Economia possível: R$ 5,00 (50,0%)')).toBeTruthy()
  })

})
