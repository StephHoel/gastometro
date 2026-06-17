import type { ReminderProps } from '@/interfaces/ReminderProps'
import { parseReminderDate } from '@/utils/functions/DateFunctions'
import { ERROR } from '@/constants/text/error'

export const ReminderService = {
  validateCreateInput(payload: { title: string; datetimeISO: string; listId: string }): string | null {
    if (!payload.listId.trim()) return ERROR.reminder_list_required
    if (!payload.title.trim()) return ERROR.reminder_title_required

    const parsed = parseReminderDate(payload.datetimeISO)
    if (!parsed) return ERROR.reminder_invalid_datetime
    if (parsed.getTime() <= Date.now()) return ERROR.reminder_past_datetime

    return null
  },

  validateUpdateInput(payload: { title: string; datetimeISO: string }): string | null {
    if (!payload.title.trim()) return 'Título do lembrete é obrigatório.'

    const parsed = parseReminderDate(payload.datetimeISO)
    if (!parsed) return 'Data/hora inválida para o lembrete.'
    if (parsed.getTime() <= Date.now()) return 'Escolha uma data/hora futura para o lembrete.'

    return null
  },

  isOverdue(reminder: ReminderProps, now = new Date()): boolean {
    const parsed = parseReminderDate(reminder.datetimeISO)
    if (!parsed) return false
    return parsed.getTime() <= now.getTime()
  },

  toDateInputValue(datetimeISO: string) {
    const parsed = parseReminderDate(datetimeISO)
    if (!parsed) return { date: '', time: '' }

    const pad = (value: number) => value.toString().padStart(2, '0')
    const yyyy = parsed.getFullYear()
    const mm = pad(parsed.getMonth() + 1)
    const dd = pad(parsed.getDate())
    const hh = pad(parsed.getHours())
    const min = pad(parsed.getMinutes())

    return {
      date: `${yyyy}-${mm}-${dd}`,
      time: `${hh}:${min}`,
    }
  },

  fromDateAndTime(date: string, time: string): string | null {
    const trimmedDate = date.trim()
    const trimmedTime = time.trim()
    if (!trimmedDate || !trimmedTime) return null

    const raw = `${trimmedDate}T${trimmedTime}:00`
    const parsed = new Date(raw)
    if (Number.isNaN(parsed.getTime())) return null

    return parsed.toISOString()
  },
}
