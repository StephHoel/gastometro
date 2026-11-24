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

    await fireEvent.changeText(screen.getByLabelText('Lugar Input'), ' Mercado Central ')
    await fireEvent.changeText(screen.getByLabelText('Observação Input'), ' Unidade Centro ')
    await fireEvent.press(screen.getByText('Adicionar lugar'))

    expect(usePriceComparisonStore.getState().places[0]).toMatchObject({
      name: 'Mercado Central',
      note: 'Unidade Centro',
    })
    expect(mockPush).toHaveBeenCalledWith('/price-comparison')
  })

  it('impede lugar vazio e nomes duplicados', async () => {
    usePriceComparisonStore.getState().addPlace({ name: 'Mercado Central' })
    const screen = await render(<FormMarket buttonTitle="Adicionar lugar" />)

    await fireEvent.press(screen.getByText('Adicionar lugar'))
    expect(AlertService.ok).toHaveBeenCalled()

    await fireEvent.changeText(screen.getByLabelText('Lugar Input'), 'mercado central')
    await fireEvent.press(screen.getByText('Adicionar lugar'))
    expect(AlertService.ok).toHaveBeenCalledTimes(2)
    expect(usePriceComparisonStore.getState().places).toHaveLength(1)
  })

  it('cadastra item com preços vinculados aos respectivos lugares', async () => {
    usePriceComparisonStore.setState({
      places: [{ id: 'place-1', name: 'Mercado A' }],
      entries: [],
    })
    const screen = await render(<FormCart buttonTitle="Adicionar item" />)

    await fireEvent.changeText(screen.getByLabelText('Nome do item Input'), 'Arroz')
    await fireEvent.changeText(screen.getByLabelText('Referência de quantidade Input'), '1 kg')
    await fireEvent.changeText(screen.getByLabelText('Preço em Mercado A Input'), '10,50')
    await fireEvent.press(screen.getByText('Adicionar item'))

    expect(usePriceComparisonStore.getState().entries[0]).toMatchObject({
      itemName: 'Arroz',
      quantityReference: '1 kg',
      pricesByPlace: [{ placeId: 'place-1', price: '10,50' }],
    })
    expect(mockPush).toHaveBeenCalledWith('/price-comparison')
  })

  it('permite cadastrar item sem preço', async () => {
    usePriceComparisonStore.setState({
      places: [{ id: 'place-1', name: 'Mercado A' }],
      entries: [],
    })
    const screen = await render(<FormCart buttonTitle="Adicionar item" />)

    await fireEvent.changeText(screen.getByLabelText('Nome do item Input'), 'Feijão')
    await fireEvent.press(screen.getByText('Adicionar item'))

    expect(usePriceComparisonStore.getState().entries[0].pricesByPlace).toEqual([])
    expect(AlertService.ok).not.toHaveBeenCalled()
  })

  it('rejeita item sem nome e preço inválido', async () => {
    usePriceComparisonStore.setState({
      places: [{ id: 'place-1', name: 'Mercado A' }],
      entries: [],
    })
    const screen = await render(<FormCart buttonTitle="Adicionar item" />)

    await fireEvent.press(screen.getByText('Adicionar item'))
    expect(AlertService.ok).toHaveBeenCalledTimes(1)

    await fireEvent.changeText(screen.getByLabelText('Nome do item Input'), 'Café')
    await fireEvent.changeText(screen.getByLabelText('Preço em Mercado A Input'), '-1')
    await fireEvent.press(screen.getByText('Adicionar item'))
    expect(AlertService.ok).toHaveBeenCalledTimes(2)
    expect(usePriceComparisonStore.getState().entries).toHaveLength(0)
  })
})
