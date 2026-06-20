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

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function formatDateInput(text: string): string {
  const digits = text.replace(/\D/g, "").slice(0, 8)

  const year = digits.slice(0, 4)
  const monthDigits = digits.slice(4, 6)
  const dayDigits = digits.slice(6, 8)

  if (digits.length <= 4) return year

  let month = monthDigits
  if (monthDigits.length === 2) {
    const monthValue = clamp(Number.parseInt(monthDigits, 10), 1, 12)
    month = monthValue.toString().padStart(2, '0')
  }

  if (digits.length <= 6) return `${year}-${month}`

  let day = dayDigits
  if (dayDigits.length === 2 && month.length === 2) {
    const yearValue = Number.parseInt(year || '0', 10)
    const monthValue = Number.parseInt(month, 10)
    const maxDay = getDaysInMonth(yearValue, monthValue)
    const dayValue = clamp(Number.parseInt(dayDigits, 10), 1, maxDay)

    day = dayValue.toString().padStart(2, '0')
  }

  return `${year}-${month}-${day}`
}

export function formatTimeInput(text: string): string {
  const digits = text.replace(/\D/g, "").slice(0, 4)

  const hoursDigits = digits.slice(0, 2)
  const minutesDigits = digits.slice(2, 4)

  let hours = hoursDigits
  if (hoursDigits.length === 2) {
    const hoursValue = clamp(Number.parseInt(hoursDigits, 10), 0, 23)
    hours = hoursValue.toString().padStart(2, '0')
  }

  if (digits.length <= 2) return hours

  let minutes = minutesDigits
  if (minutesDigits.length === 2) {
    const minutesValue = clamp(Number.parseInt(minutesDigits, 10), 0, 59)
    minutes = minutesValue.toString().padStart(2, '0')
  }

  return `${hours}:${minutes}`
}