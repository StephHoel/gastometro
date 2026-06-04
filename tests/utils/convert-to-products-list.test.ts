jest.mock('react-native-uuid', () => ({
  __esModule: true,
  default: {
    v4: jest.fn(() => 'mock-uuid'),
  },
}))

import uuid from 'react-native-uuid'
import { ConvertToProductsList } from '@/utils/functions/ConvertToProductsList'

describe('ConvertToProductsList', () => {
  beforeEach(() => {
    const uuidModule = uuid as unknown as { v4: jest.Mock }
    uuidModule.v4.mockReset()
    uuidModule.v4
      .mockReturnValueOnce('id-1')
      .mockReturnValueOnce('id-2')
  })

  it('deve converter lista no formato WhatsApp do app', () => {
    const clipboard = [
      '#Gastômetro',
      '## Para adicionar esta lista ao seu app, copie a mensagem sem modificá-la e cole no ícone de compartilhar',
      '--',
      '|| 2x Arroz | R$ 10,00 | R$ 20,00',
      '|| 1,5x Feijão Preto | R$ 8,00 | R$ 12,00',
      '--',
      'Valor Total: R$ 32,00',
    ].join('\n')

    expect(ConvertToProductsList(clipboard)).toEqual([
      {
        id: 'id-1',
        item: 'Arroz',
        quantity: '2',
        price: '10.00',
        collected: false,
      },
      {
        id: 'id-2',
        item: 'Feijão Preto',
        quantity: '1.5',
        price: '8.00',
        collected: false,
      },
    ])
  })

  it('deve ignorar linhas malformadas e valores negativos', () => {
    const clipboard = [
      '#Gastômetro',
      '--',
      '|| 2x Arroz | R$ 10,00 | R$ 20,00',
      'linha inválida',
      '|| -1x Item Negativo | R$ 3,00 | R$ -3,00',
      '|| 1x Item Sem Preço | abc | R$ 0,00',
      '--',
    ].join('\n')

    expect(ConvertToProductsList(clipboard)).toEqual([
      {
        id: 'id-1',
        item: 'Arroz',
        quantity: '2',
        price: '10.00',
        collected: false,
      },
    ])
  })

  it('deve retornar lista vazia para entrada inválida', () => {
    expect(ConvertToProductsList('')).toEqual([])
    expect(ConvertToProductsList('sem separadores')).toEqual([])
  })
})
