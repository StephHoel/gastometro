import { ReminderService } from '@/services/ReminderService'

describe('ReminderService', () => {
  it('deve validar campos obrigatórios na criação', () => {
    const error = ReminderService.validateCreateInput({
      title: '',
      datetimeISO: '2099-01-01T10:00:00.000Z',
      listId: 'list-1',
    })

    expect(error).toBe('Título do lembrete é obrigatório.')
  })

  it('deve rejeitar data no passado', () => {
    const error = ReminderService.validateCreateInput({
      title: 'Teste',
      datetimeISO: '2000-01-01T10:00:00.000Z',
      listId: 'list-1',
    })

    expect(error).toBe('Escolha uma data/hora futura para o lembrete.')
  })

  it('deve converter data e hora para ISO', () => {
    const iso = ReminderService.fromDateAndTime('2099-12-31', '23:59')

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
