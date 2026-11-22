import {
  formatDateInput,
  formatTimeInput,
  makeDefaultDateTime,
  nowISO,
  parseReminderDate,
  toDisplayDate,
  toDateInputValue,
  fromDateAndTime,
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

  it('parseReminderDate e toDateInputValue devem preservar datas válidas', () => {
    expect(parseReminderDate('2026-06-21T12:34:00')).toBeInstanceOf(Date)
    expect(toDateInputValue('inválida')).toEqual({ date: '', time: '' })
    expect(toDateInputValue('2026-06-21T12:34:00')).toEqual({ date: '2026-06-21', time: '12:34' })
  })

  it('fromDateAndTime valida campos obrigatórios e datas inválidas', () => {
    expect(fromDateAndTime('', '12:00')).toBeNull()
    expect(fromDateAndTime('2026-06-21', '')).toBeNull()
    expect(fromDateAndTime('not-a-date-at-all-xyz', 'not-a-time')).toBeNull()
    expect(fromDateAndTime('2026-06-21', '12:30')).toBe(new Date('2026-06-21T12:30:00').toISOString())
  })

  it('formatDateInput cobre entradas parciais, remove caracteres e limita o tamanho', () => {
    expect(formatDateInput('20')).toBe('20')
    expect(formatDateInput('2026')).toBe('2026')
    expect(formatDateInput('2026-0')).toBe('2026-0')
    expect(formatDateInput('202601')).toBe('2026-01')
    expect(formatDateInput('2026010')).toBe('2026-01-0')
    expect(formatDateInput('2026/13/40-extra')).toBe('2026-12-31')
  })

  it('formatTimeInput cobre entradas parciais e normaliza minutos e horas', () => {
    expect(formatTimeInput('')).toBe('')
    expect(formatTimeInput('1')).toBe('1')
    expect(formatTimeInput('12')).toBe('12')
    expect(formatTimeInput('123')).toBe('12:3')
    expect(formatTimeInput('9999')).toBe('23:59')
    expect(formatTimeInput('12:30:45')).toBe('12:30')
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
