import { makeDefaultDateTime, nowISO, parseReminderDate, toDisplayDate } from '@/utils/functions/DateFunctions'

describe('DateFunctions', () => {
  it('toDisplayDate deve retornar o valor original quando inválido', () => {
    expect(toDisplayDate('invalida')).toBe('invalida')
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
})
