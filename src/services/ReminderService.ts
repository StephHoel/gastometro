import type { ReminderProps } from '@/interfaces/ReminderProps'
import { parseReminderDate } from '@/utils/functions/DateFunctions'
import { ERROR } from '@/constants/text/error'
import { ReminderStatus } from '@/enums/ReminderStatus'

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
    if (!payload.title.trim()) return ERROR.reminder.title_required

    const parsed = parseReminderDate(payload.datetimeISO)
    if (!parsed) return ERROR.reminder.invalid_datetime
    if (parsed.getTime() <= Date.now()) return ERROR.reminder.past_datetime

    return null
  },

  isOverdue(reminder: ReminderProps, now = new Date()): boolean {
    const parsed = parseReminderDate(reminder.datetimeISO)
    if (!parsed) return false
    return parsed.getTime() <= now.getTime()
  },

  isScheduled(reminder: ReminderProps): boolean {
    return this.isEnabled(reminder) && typeof reminder.notificationId === 'string'
  },

  isEnabled(reminder: ReminderProps): boolean {
    return reminder.enabled
  },

  getStatus(reminder: ReminderProps): string {
    if (this.isOverdue(reminder)) return ReminderStatus.Overdue
    if (!this.isEnabled(reminder)) return ReminderStatus.Disabled
    if (this.isScheduled(reminder)) return ReminderStatus.Scheduled
    return ReminderStatus.NotScheduled
  },
}
