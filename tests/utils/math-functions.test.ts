import {
  Divide,
  HasNegativeSignal,
  Multiply,
  NormalizeDecimalInput,
  NormalizeNumericString,
  ParseToFloat,
  ReduceProducts,
  SetCurrency,
} from '@/utils/functions/MathFunctions'
import type { StateProps } from '@/interfaces/StateProps'

describe('MathFunctions', () => {
  it('ParseToFloat deve aceitar formatos pt-BR e limpar texto', () => {
    expect(ParseToFloat('1.234,56')).toBe(1234.56)
    expect(ParseToFloat('10,5')).toBe(10.5)
    expect(ParseToFloat('R$ 8,90')).toBe(8.9)
  })

  it('ParseToFloat deve retornar 0 para negativos, inválidos ou não finitos', () => {
    expect(ParseToFloat('-5')).toBe(0)
    expect(ParseToFloat('abc')).toBe(0)
    expect(ParseToFloat(Number.NaN)).toBe(0)
  })

  it('HasNegativeSignal deve identificar sinal negativo', () => {
    expect(HasNegativeSignal('-10')).toBe(true)
    expect(HasNegativeSignal('10')).toBe(false)
  })

  it('NormalizeDecimalInput deve filtrar caracteres e limitar casas', () => {
    expect(NormalizeDecimalInput('12,3456', 2)).toBe('12.34')
    expect(NormalizeDecimalInput('1.23456', 3)).toBe('1.234')
    expect(NormalizeDecimalInput('abc10,9xyz', 2)).toBe('10.9')
  })

  it('NormalizeNumericString deve normalizar entrada com regra de zero explícito', () => {
    expect(NormalizeNumericString('', '0.00', ['0', '0.00'])).toBe('0.00')
    expect(NormalizeNumericString('0', '0.00', ['0', '0.00'])).toBe('0')
    expect(NormalizeNumericString('1,5', '0.00', ['0', '0.00'])).toBe('1.5')
  })

  it('Multiply e Divide devem operar com strings e números', () => {
    expect(Multiply('2', '3,5')).toBe(7)
    expect(Divide('7', '2')).toBe(3.5)
    expect(Divide('99', '0')).toBe(0)
  })

  it('SetCurrency deve seguir formato BRL pt-BR', () => {
    const expected = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(1234.56)

    expect(SetCurrency(1234.56)).toBe(expected)
  })

  it('ReduceProducts deve somar subtotais da lista', () => {
    const cartStore: StateProps = {
      products: [
        { id: '1', item: 'Arroz', quantity: '2', price: '10', collected: false },
        { id: '2', item: 'Feijão', quantity: '1,5', price: '8', collected: false },
      ],
      add: jest.fn(),
      edit: jest.fn(),
      replace: jest.fn(),
      remove: jest.fn(),
      get: jest.fn(),
      clear: jest.fn(),
    }

    expect(ReduceProducts(cartStore)).toBe(32)
  })
})
