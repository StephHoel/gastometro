import { ReminderService } from '@/services/ReminderService'

export function toDisplayDate(datetimeISO: string) {
  const parsed = new Date(datetimeISO)

  if (Number.isNaN(parsed.getTime()))
    return datetimeISO

  return parsed.toLocaleString('pt-BR')
}

export function makeDefaultDateTime() {
  const oneHourAhead = new Date(Date.now() + 60 * 60 * 1000)

  return ReminderService.toDateInputValue(oneHourAhead.toISOString())
}

export function parseReminderDate(datetimeISO: string): Date | null {
  const parsed = new Date(datetimeISO)

  if (Number.isNaN(parsed.getTime()))
    return null

  return parsed
}

export function nowISO() {
  return new Date().toISOString()
}
