import { FormatTextLine, NormalizeItemName, ToTitleCase } from '@/utils/functions/StringFunctions'

describe('StringFunctions', () => {
  it('FormatTextLine deve formatar linha com preço em BRL', () => {
    const result = FormatTextLine({
      id: '1',
      item: 'Arroz',
      quantity: '2',
      price: '10,5',
      collected: false,
    })

    const price = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(10.5)
    expect(result).toBe('2x Arroz | ' + price)
  })

  it('ToTitleCase deve normalizar maiúsculas e espaços', () => {
    expect(ToTitleCase('  aRRoZ   INTEGRAL  ')).toBe('Arroz   Integral')
    expect(ToTitleCase('feijão preto')).toBe('Feijão Preto')
  })

  it('NormalizeItemName deve reduzir espaços e colocar em minúsculas', () => {
    expect(NormalizeItemName('  Arroz   Branco  ')).toBe('arroz branco')
  })
})
