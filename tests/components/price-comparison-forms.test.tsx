import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import { FormMarket } from '@/components/PriceComparison/FormMarket'
import { FormCart } from '@/components/PriceComparison/FormCart'
import { usePriceComparisonStore } from '@/stores/PriceComparisonStore'
import { AlertService } from '@/services/AlertService'
import { mockPush } from '../setup/mocks/expo-router'

jest.mock('@/hooks/useInitAlert', () => ({ useInitAlert: jest.fn() }))
jest.mock('@/services/AlertService', () => ({
  AlertService: {
    ok: jest.fn(),
  },
}))

describe('Formulários de comparação de preços', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    usePriceComparisonStore.setState({ places: [], entries: [] })
  })

  it('cadastra lugar, normaliza os campos e retorna à comparação', async () => {
    const screen = await render(<FormMarket buttonTitle="Adicionar lugar" />)

    const marketInput = screen.getByLabelText('Nome do lugar')
    expect(marketInput.props.accessibilityHint).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Adicionar lugar' }).props.accessibilityHint).toBe(
      'Valida e salva os dados do lugar',
    )
    await fireEvent.changeText(marketInput, ' Mercado Central ')
    await fireEvent.changeText(screen.getByLabelText('Observação'), ' Unidade Centro ')
    await fireEvent.press(screen.getByRole('button', { name: 'Adicionar lugar' }))

    expect(usePriceComparisonStore.getState().places[0]).toMatchObject({
      name: 'Mercado Central',
      note: 'Unidade Centro',
    })
    expect(mockPush).toHaveBeenCalledWith('/price-comparison')
  })

  it('edita lugar existente sem criar um novo registro', async () => {
    usePriceComparisonStore.getState().addPlace({ name: 'Mercado Antigo' })
    const place = usePriceComparisonStore.getState().places[0]
    const screen = await render(<FormMarket data={place} buttonTitle="Editar lugar" />)

    await fireEvent.changeText(screen.getByLabelText('Nome do lugar'), 'Mercado Atual')
    await fireEvent.press(screen.getByRole('button', { name: 'Editar lugar' }))

    expect(usePriceComparisonStore.getState().places).toHaveLength(1)
    expect(usePriceComparisonStore.getState().places[0].name).toBe('Mercado Atual')
  })

  it('impede lugar vazio e nomes duplicados', async () => {
    usePriceComparisonStore.getState().addPlace({ name: 'Mercado Central' })
    const screen = await render(<FormMarket buttonTitle="Adicionar lugar" />)

    await fireEvent.press(screen.getByRole('button', { name: 'Adicionar lugar' }))
    expect(AlertService.ok).toHaveBeenCalled()

    await fireEvent.changeText(screen.getByLabelText('Nome do lugar'), 'mercado central')
    await fireEvent.press(screen.getByRole('button', { name: 'Adicionar lugar' }))
    expect(AlertService.ok).toHaveBeenCalledTimes(2)
    expect(usePriceComparisonStore.getState().places).toHaveLength(1)
  })

  it('cadastra item com preços vinculados aos respectivos lugares', async () => {
    usePriceComparisonStore.setState({
      places: [{ id: 'place-1', name: 'Mercado A' }],
      entries: [],
    })
    const screen = await render(<FormCart buttonTitle="Adicionar item" />)

    const itemNameInput = screen.getByLabelText('Nome do item')
    expect(itemNameInput.props.accessibilityHint).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Adicionar item' }).props.accessibilityHint).toBe(
      'Valida e salva os dados da comparação',
    )
    await fireEvent.changeText(itemNameInput, 'Arroz')
    await fireEvent.changeText(screen.getByLabelText('Referência de quantidade'), '1 kg')
    await fireEvent.changeText(screen.getByLabelText('Preço em Mercado A'), '10,50')
    await fireEvent.press(screen.getByRole('button', { name: 'Adicionar item' }))

    expect(usePriceComparisonStore.getState().entries[0]).toMatchObject({
      itemName: 'Arroz',
      quantityReference: '1 kg',
      pricesByPlace: [{ placeId: 'place-1', price: '10,50' }],
    })
    expect(mockPush).toHaveBeenCalledWith('/price-comparison')
  })

  it('edita item e mantém os preços associados aos lugares', async () => {
    usePriceComparisonStore.setState({
      places: [{ id: 'place-1', name: 'Mercado A' }],
      entries: [{
        id: 'entry-1',
        itemName: 'Arroz',
        quantityReference: '1 kg',
        pricesByPlace: [{ placeId: 'place-1', price: '10,00' }],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      }],
    })
    const entry = usePriceComparisonStore.getState().entries[0]
    const screen = await render(<FormCart data={entry} buttonTitle="Editar item" />)

    expect(screen.getByLabelText('Preço em Mercado A').props.value).toBe('10,00')
    await fireEvent.changeText(screen.getByLabelText('Nome do item'), 'Arroz integral')
    await fireEvent.changeText(screen.getByLabelText('Preço em Mercado A'), '11,25')
    await fireEvent.press(screen.getByRole('button', { name: 'Editar item' }))

    expect(usePriceComparisonStore.getState().entries).toHaveLength(1)
    expect(usePriceComparisonStore.getState().entries[0]).toMatchObject({
      itemName: 'Arroz integral',
      pricesByPlace: [{ placeId: 'place-1', price: '11,25' }],
    })
  })

  it('permite cadastrar item sem preço', async () => {
    usePriceComparisonStore.setState({
      places: [{ id: 'place-1', name: 'Mercado A' }],
      entries: [],
    })
    const screen = await render(<FormCart buttonTitle="Adicionar item" />)

    await fireEvent.changeText(screen.getByLabelText('Nome do item'), 'Feijão')
    await fireEvent.press(screen.getByRole('button', { name: 'Adicionar item' }))

    expect(usePriceComparisonStore.getState().entries[0].pricesByPlace).toEqual([])
    expect(AlertService.ok).not.toHaveBeenCalled()
  })

  it('rejeita item sem nome e preço inválido', async () => {
    usePriceComparisonStore.setState({
      places: [{ id: 'place-1', name: 'Mercado A' }],
      entries: [],
    })
    const screen = await render(<FormCart buttonTitle="Adicionar item" />)

    await fireEvent.press(screen.getByRole('button', { name: 'Adicionar item' }))
    expect(AlertService.ok).toHaveBeenCalledTimes(1)

    await fireEvent.changeText(screen.getByLabelText('Nome do item'), 'Café')
    await fireEvent.changeText(screen.getByLabelText('Preço em Mercado A'), '-1')
    await fireEvent.press(screen.getByRole('button', { name: 'Adicionar item' }))
    expect(AlertService.ok).toHaveBeenCalledTimes(2)
    expect(usePriceComparisonStore.getState().entries).toHaveLength(0)
  })
})
