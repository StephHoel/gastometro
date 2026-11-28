import { IsValidImportedNumber } from '@/utils/functions/NumberFunctions'

describe('NumberFunctions', () => {
  it('deve aceitar números inteiros e decimais com vírgula ou ponto', () => {
    expect(IsValidImportedNumber('10')).toBe(true)
    expect(IsValidImportedNumber('10,5')).toBe(true)
    expect(IsValidImportedNumber('10.5')).toBe(true)
  })

  it('deve rejeitar vazio, negativo e inválido', () => {
    expect(IsValidImportedNumber('')).toBe(false)
    expect(IsValidImportedNumber('   ')).toBe(false)
    expect(IsValidImportedNumber('-1')).toBe(false)
    expect(IsValidImportedNumber('abc')).toBe(false)
    expect(IsValidImportedNumber('1,2,3')).toBe(false)
  })
})
