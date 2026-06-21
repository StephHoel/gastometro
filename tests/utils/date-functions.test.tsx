import {
  formatDateInput,
  formatTimeInput,
  makeDefaultDateTime,
  nowISO,
  parseReminderDate,
  toDisplayDate,
} from '@/utils/functions/DateFunctions'

describe('DateFunctions', () => {
  it('toDisplayDate deve retornar o valor original quando inválido', () => {
    expect(toDisplayDate('invalida')).toBe('invalida')
  })

  it('toDisplayDate deve formatar no padrão dd/MM/yyyy HH:mm', () => {
    expect(toDisplayDate('2026-06-21T12:34:56')).toBe('21/06/2026 12:34')
  })

  it('parseReminderDate deve retornar null para data inválida', () => {
    expect(parseReminderDate('sem-data')).toBeNull()
  })

  it('makeDefaultDateTime deve retornar data/hora preenchidas', () => {
    const defaults = makeDefaultDateTime()

    expect(defaults.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(defaults.time).toMatch(/^\d{2}:\d{2}$/)
  })

  it('nowISO deve gerar ISO válido', () => {
    const iso = nowISO()
    const parsed = new Date(iso)

    expect(Number.isNaN(parsed.getTime())).toBe(false)
  })

  it('formatDateInput deve limitar mês para faixa válida', () => {
    expect(formatDateInput('202613')).toBe('2026-12')
  })

  it('formatDateInput deve limitar dia para o máximo do mês', () => {
    expect(formatDateInput('20260231')).toBe('2026-02-28')
  })

  it('formatDateInput deve considerar ano bissexto no limite do dia', () => {
    expect(formatDateInput('20240231')).toBe('2024-02-29')
  })

  it('formatTimeInput deve limitar hora para 23', () => {
    expect(formatTimeInput('29')).toBe('23')
  })

  it('formatTimeInput deve limitar minutos para 59', () => {
    expect(formatTimeInput('2361')).toBe('23:59')
  })
})
