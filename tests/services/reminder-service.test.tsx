import { ReminderService } from '@/services/ReminderService'
import { ReminderStatus } from '@/enums/ReminderStatus'
import type { ReminderProps } from '@/interfaces/ReminderProps'
import { ERROR } from '@/constants/text/error'
import { fromDateAndTime } from '@/utils/functions/DateFunctions'

describe('ReminderService', () => {
  it('deve validar campos obrigatórios na criação', () => {
    const error = ReminderService.validateCreateInput({
      title: '',
      datetimeISO: '2099-01-01T10:00:00.000Z',
      listId: 'list-1',
    })

    expect(error).toBe(ERROR.reminder_title_required)
  })

  it('deve rejeitar data no passado', () => {
    const error = ReminderService.validateCreateInput({
      title: 'Teste',
      datetimeISO: '2000-01-01T10:00:00.000Z',
      listId: 'list-1',
    })

    expect(error).toBe(ERROR.reminder_past_datetime)
  })

  it('deve converter data e hora para ISO', () => {
    const iso = fromDateAndTime('2099-12-31', '23:59')

    expect(iso).toBeTruthy()
    expect(Number.isNaN(new Date(iso as string).getTime())).toBe(false)
  })

  it('deve detectar lembrete vencido', () => {
    const isOverdue = ReminderService.isOverdue(
      {
        id: 'r-1',
        title: 'Vencido',
        datetimeISO: '2000-01-01T10:00:00.000Z',
        enabled: true,
        listId: 'list-1',
        createdAt: '2000-01-01T10:00:00.000Z',
        updatedAt: '2000-01-01T10:00:00.000Z',
      },
      new Date('2026-01-01T10:00:00.000Z'),
    )

    expect(isOverdue).toBe(true)
  })
})

function makeReminder(overrides: Partial<ReminderProps> = {}): ReminderProps {
  return {
    id: 'r-1',
    title: 'Lembrete',
    datetimeISO: '2099-01-01T10:00:00.000Z',
    enabled: true,
    listId: 'list-1',
    createdAt: '2099-01-01T09:00:00.000Z',
    updatedAt: '2099-01-01T09:00:00.000Z',
    ...overrides,
  }
}

describe('ReminderService - validateUpdateInput', () => {
  it('deve retornar erro quando título está vazio', () => {
    const error = ReminderService.validateUpdateInput({
      title: '',
      datetimeISO: '2099-01-01T10:00:00.000Z',
    })
    expect(error).toBe(ERROR.reminder.title_required)
  })

  it('deve retornar erro quando data/hora é inválida', () => {
    const error = ReminderService.validateUpdateInput({
      title: 'Teste',
      datetimeISO: 'data-invalida',
    })
    expect(error).toBe(ERROR.reminder.invalid_datetime)
  })

  it('deve retornar erro quando data está no passado', () => {
    const error = ReminderService.validateUpdateInput({
      title: 'Teste',
      datetimeISO: '2000-01-01T10:00:00.000Z',
    })
    expect(error).toBe(ERROR.reminder.past_datetime)
  })

  it('deve retornar null quando válido', () => {
    const error = ReminderService.validateUpdateInput({
      title: 'Teste',
      datetimeISO: '2099-01-01T10:00:00.000Z',
    })
    expect(error).toBeNull()
  })
})

describe('ReminderService - isEnabled', () => {
  it('deve retornar true quando lembrete está ativo', () => {
    expect(ReminderService.isEnabled(makeReminder({ enabled: true }))).toBe(true)
  })

  it('deve retornar false quando lembrete está desativado', () => {
    expect(ReminderService.isEnabled(makeReminder({ enabled: false }))).toBe(false)
  })
})

describe('ReminderService - isScheduled', () => {
  it('deve retornar true quando ativo e tem notificationId', () => {
    expect(ReminderService.isScheduled(makeReminder({ enabled: true, notificationId: 'n-1' }))).toBe(true)
  })

  it('deve retornar false quando desativado', () => {
    expect(ReminderService.isScheduled(makeReminder({ enabled: false, notificationId: 'n-1' }))).toBe(false)
  })

  it('deve retornar false quando sem notificationId', () => {
    expect(ReminderService.isScheduled(makeReminder({ enabled: true, notificationId: undefined }))).toBe(false)
  })
})

describe('ReminderService - getStatus', () => {
  it('deve retornar Overdue quando vencido', () => {
    const reminder = makeReminder({ datetimeISO: '2000-01-01T10:00:00.000Z', enabled: true })
    expect(ReminderService.getStatus(reminder)).toBe(ReminderStatus.Overdue)
  })

  it('deve retornar Disabled quando desativado e não vencido', () => {
    const reminder = makeReminder({ datetimeISO: '2099-01-01T10:00:00.000Z', enabled: false })
    expect(ReminderService.getStatus(reminder)).toBe(ReminderStatus.Disabled)
  })

  it('deve retornar Scheduled quando ativo, não vencido e com notificationId', () => {
    const reminder = makeReminder({ datetimeISO: '2099-01-01T10:00:00.000Z', enabled: true, notificationId: 'n-1' })
    expect(ReminderService.getStatus(reminder)).toBe(ReminderStatus.Scheduled)
  })

  it('deve retornar NotScheduled quando ativo, não vencido e sem notificationId', () => {
    const reminder = makeReminder({ datetimeISO: '2099-01-01T10:00:00.000Z', enabled: true, notificationId: undefined })
    expect(ReminderService.getStatus(reminder)).toBe(ReminderStatus.NotScheduled)
  })
})
