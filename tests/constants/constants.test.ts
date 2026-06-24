import { TITLES } from '@/constants/titles'
import { CALC } from '@/constants/text/calculator'

describe('Constants', () => {
  describe('TITLES', () => {
    it('deve conter as rotas principais', () => {
      expect(TITLES['/']).toBe('Gastômetro')
      expect(TITLES['/calculator']).toBe('Calculadora')
      expect(TITLES['/lists']).toBe('Listas')
      expect(TITLES['/reminders']).toBe('Central de Lembretes')
    })
  })

  describe('CALC', () => {
    it('deve conter placeholders corretos', () => {
      expect(CALC.placeholder.price).toBe('Preço da Embalagem')
      expect(CALC.placeholder.quantity).toBe('Quantidade na Embalagem')
    })

    it('deve conter textos de botão corretos', () => {
      expect(CALC.button.submit).toBe('Calcular')
      expect(CALC.button.clear).toBe('Limpar')
    })

    it('answer deve formatar o valor corretamente', () => {
      expect(CALC.answer('R$ 1,50')).toBe('Preço por Unidade: R$ 1,50')
    })
  })
})
