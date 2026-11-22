import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import uuid from 'react-native-uuid'
import PriceComparison from '@/app/price-comparison'
import { usePriceComparisonStore } from '@/stores/PriceComparisonStore'

describe('PriceComparison screen', () => {
  let id = 0

  beforeEach(() => {
    id = 0
    jest.mocked(uuid.v4).mockImplementation(() => [++id])
    usePriceComparisonStore.setState({ places: [], entries: [] })
  })

  it('cadastra lugares e impede nomes duplicados', async () => {
    const screen = await render(<PriceComparison />)

    await fireEvent.changeText(screen.getByLabelText('Nome do lugar'), ' Mercado Central ')
    await fireEvent.changeText(screen.getByLabelText('Observação do lugar'), ' Unidade do bairro ')
    await fireEvent.press(screen.getByText('Adicionar lugar'))

    expect(screen.getAllByText('Mercado Central')[0]).toBeTruthy()
    expect(screen.getByText('Unidade do bairro')).toBeTruthy()

    await fireEvent.changeText(screen.getByLabelText('Nome do lugar'), 'mercado central')
    await fireEvent.press(screen.getByText('Adicionar lugar'))

    expect(screen.getByText('Já existe um lugar com esse nome.')).toBeTruthy()
  })

  it('edita, cancela e remove lugares', async () => {
    const store = usePriceComparisonStore.getState()
    store.addPlace({ name: 'Mercado A', note: 'Antiga' })
    const screen = await render(<PriceComparison />)

    await fireEvent.press(screen.getByLabelText('Editar Mercado A'))
    expect(screen.getByText('Editar lugar')).toBeTruthy()
    await fireEvent.changeText(screen.getByLabelText('Nome do lugar'), 'Mercado B')
    await fireEvent.press(screen.getByText('Cancelar'))

    expect(screen.getAllByText('Mercado A')[0]).toBeTruthy()
    await fireEvent.press(screen.getByLabelText('Editar Mercado A'))
    await fireEvent.changeText(screen.getByLabelText('Nome do lugar'), 'Mercado B')
    await fireEvent.press(screen.getByText('Salvar lugar'))
    expect(screen.getAllByText('Mercado B')[0]).toBeTruthy()

    await fireEvent.press(screen.getByLabelText('Remover Mercado B'))
    expect(screen.queryByText('Mercado B')).toBeNull()
  })

  it('cadastra, edita, ordena e remove itens e mostra cesta completa ou incompleta', async () => {
    const store = usePriceComparisonStore.getState()
    store.addPlace({ name: 'Mercado A' })
    store.addPlace({ name: 'Mercado B' })
    const [a, b] = usePriceComparisonStore.getState().places
    const screen = await render(<PriceComparison />)

    await fireEvent.changeText(screen.getByLabelText('Nome do item'), 'Arroz')
    await fireEvent.changeText(screen.getByLabelText('Quantidade de referência'), '1 kg')
    await fireEvent.changeText(screen.getByLabelText('Preço em Mercado A'), '10,00')
    await fireEvent.changeText(screen.getByLabelText('Preço em Mercado B'), '8,00')
    await fireEvent.press(screen.getByText('Adicionar item'))

    expect(screen.getByText('Arroz')).toBeTruthy()
    expect(screen.getByText('Mercado B · Melhor preço')).toBeTruthy()
    expect(screen.getAllByText('Cesta completa')[0]).toBeTruthy()
    expect(screen.getByText(/Menor total/)).toBeTruthy()

    await fireEvent.press(screen.getByLabelText('Editar comparação de Arroz'))
    await fireEvent.changeText(screen.getByLabelText('Nome do item'), 'Arroz integral')
    await fireEvent.press(screen.getByText('Salvar item'))
    expect(screen.getByText('Arroz integral')).toBeTruthy()

    await fireEvent.press(screen.getAllByText(/Ordenar por/)[0])
    expect(screen.getByText('Ordenar por menor preço')).toBeTruthy()
    expect(screen.getByText('Ordenar por nome')).toBeTruthy()

    await fireEvent.press(screen.getByLabelText('Remover comparação de Arroz integral'))
    expect(screen.queryByText('Arroz integral')).toBeNull()
    expect(a.id).not.toBe(b.id)
  })

  it('valida campos obrigatórios e informa ausência de lugares e itens', async () => {
    const screen = await render(<PriceComparison />)

    await fireEvent.press(screen.getByText('Adicionar lugar'))
    expect(screen.getByText('Informe o nome do lugar.')).toBeTruthy()
    expect(screen.getByText('Cadastre ao menos um lugar para informar preços.')).toBeTruthy()
    expect(screen.getByText('Adicione itens e preços para comparar a cesta.')).toBeTruthy()
    expect(screen.getByText('Nenhum item comparado ainda.')).toBeTruthy()
  })
  it('rejeita duplicidade ao editar lugar e valida preços antes de salvar', async () => {
    const store = usePriceComparisonStore.getState()
    store.addPlace({ name: 'Mercado A' })
    store.addPlace({ name: 'Mercado B' })
    const [a] = usePriceComparisonStore.getState().places
    const screen = await render(<PriceComparison />)

    await fireEvent.press(screen.getByLabelText('Editar Mercado A'))
    await fireEvent.changeText(screen.getByLabelText('Nome do lugar'), 'Mercado B')
    await fireEvent.press(screen.getByText('Salvar lugar'))
    expect(screen.getByText('Já existe um lugar com esse nome.')).toBeTruthy()
    await fireEvent.press(screen.getByText('Cancelar'))

    await fireEvent.changeText(screen.getByLabelText('Nome do item'), 'Feijão')
    await fireEvent.press(screen.getByText('Adicionar item'))
    expect(screen.getByText('Informe o preço em pelo menos um lugar.')).toBeTruthy()

    await fireEvent.changeText(screen.getByLabelText('Preço em Mercado A'), '-1')
    await fireEvent.press(screen.getByText('Adicionar item'))
    expect(screen.getByText('Informe preços válidos e não negativos.')).toBeTruthy()

    await fireEvent.changeText(screen.getByLabelText('Preço em Mercado A'), 'R$ 9,00')
    expect(screen.getByDisplayValue('9,00')).toBeTruthy()
    await fireEvent.press(screen.getByText('Adicionar item'))
    expect(screen.getByText('Feijão')).toBeTruthy()
    expect(screen.getByText('Preço faltando para um ou mais itens')).toBeTruthy()
    expect(screen.getByText('Incompleta')).toBeTruthy()

    await fireEvent.press(screen.getAllByText(/Ordenar por/)[1])
    expect(screen.getByText('Ordenar por menor total')).toBeTruthy()
    expect(screen.getByText('Ordenar por menor preço')).toBeTruthy()
    expect(a.name).toBe('Mercado A')
  })

  it('edita item sem referência de quantidade e apresenta diferença indisponível', async () => {
    usePriceComparisonStore.setState({
      places: [{ id: 'place-1', name: 'Mercado A' }],
      entries: [{ id: 'entry-1', itemName: 'Leite', pricesByPlace: [{ placeId: 'place-1', price: 'inválido' }], createdAt: '', updatedAt: '' }],
    })
    const screen = await render(<PriceComparison />)

    expect(screen.getAllByText(/Não disponível/)).toHaveLength(2)
    await fireEvent.press(screen.getByLabelText('Editar comparação de Leite'))
    expect(screen.getByLabelText('Quantidade de referência').props.value).toBe('')
    await fireEvent.press(screen.getByText('Cancelar'))
  })

})
