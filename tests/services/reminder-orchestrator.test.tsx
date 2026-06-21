import { ReminderState } from '@/enums/ReminderState'
import { ReminderOrchestrator } from '@/services/ReminderOrchestrator'
import { AlertService } from '@/services/AlertService'
import { NotificationService } from '@/services/NotificationService'
import { useReminderStore } from '@/stores/ReminderStore'

jest.mock('@/services/AlertService', () => ({
  AlertService: {
    ok: jest.fn(),
  },
}))

jest.mock('@/services/NotificationService', () => ({
  NotificationService: {
    ensurePermissionForScheduling: jest.fn(),
    cancelScheduled: jest.fn(),
    scheduleReminder: jest.fn(),
    getPermissionState: jest.fn(),
  },
}))

function makeReminder(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    title: `Lembrete ${id}`,
    datetimeISO: '2099-01-01T10:00:00.000Z',
    enabled: false,
    listId: 'list-1',
    notificationId: undefined,
    createdAt: '2099-01-01T09:00:00.000Z',
    updatedAt: '2099-01-01T09:00:00.000Z',
    ...overrides,
  }
}

function seedReminders(reminders: Array<Record<string, unknown>>) {
  useReminderStore.setState({ reminders: reminders as never[] })
}

describe('ReminderOrchestrator', () => {
  const ensurePermissionForScheduling = NotificationService.ensurePermissionForScheduling as jest.Mock
  const cancelScheduled = NotificationService.cancelScheduled as jest.Mock
  const scheduleReminder = NotificationService.scheduleReminder as jest.Mock
  const getPermissionState = NotificationService.getPermissionState as jest.Mock
  const alertOk = AlertService.ok as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    useReminderStore.setState({ reminders: [] })
  })

  it('enableReminder retorna not-found quando lembrete não existe', async () => {
    await expect(ReminderOrchestrator.enableReminder('missing')).resolves.toBe(ReminderState.NotFound)
  })

  it('enableReminder trata no-permission e limpa notificationId', async () => {
    seedReminders([makeReminder('r1', { notificationId: 'old' })])
    ensurePermissionForScheduling.mockResolvedValueOnce(false)

    await expect(ReminderOrchestrator.enableReminder('r1')).resolves.toBe(ReminderState.NoPermission)
    expect(useReminderStore.getState().getById('r1')?.enabled).toBe(true)
    expect(useReminderStore.getState().getById('r1')?.notificationId).toBeUndefined()
  })

  it('enableReminder agenda quando há permissão', async () => {
    seedReminders([makeReminder('r1', { notificationId: 'old' })])
    ensurePermissionForScheduling.mockResolvedValueOnce(true)
    scheduleReminder.mockResolvedValueOnce('new-id')

    await expect(ReminderOrchestrator.enableReminder('r1')).resolves.toBe(ReminderState.Enable)
    expect(cancelScheduled).toHaveBeenCalledWith('old')
    expect(useReminderStore.getState().getById('r1')?.notificationId).toBe('new-id')
  })

  it('disableReminder e removeReminder são no-op quando não encontrado', async () => {
    await expect(ReminderOrchestrator.disableReminder('missing')).resolves.toBeUndefined()
    await expect(ReminderOrchestrator.removeReminder('missing')).resolves.toBeUndefined()
  })

  it('disableReminder cancela e desativa lembrete', async () => {
    seedReminders([makeReminder('r1', { enabled: true, notificationId: 'n1' })])

    await ReminderOrchestrator.disableReminder('r1')

    expect(cancelScheduled).toHaveBeenCalledWith('n1')
    expect(useReminderStore.getState().getById('r1')?.enabled).toBe(false)
    expect(useReminderStore.getState().getById('r1')?.notificationId).toBeUndefined()
  })

  it('removeReminder cancela agendamento e remove item', async () => {
    seedReminders([makeReminder('r1', { notificationId: 'n1' })])

    await ReminderOrchestrator.removeReminder('r1')

    expect(cancelScheduled).toHaveBeenCalledWith('n1')
    expect(useReminderStore.getState().getById('r1')).toBeUndefined()
  })

  it('removeByListId remove todos os lembretes da lista e cancela notificações', async () => {
    seedReminders([
      makeReminder('r1', { listId: 'list-1', notificationId: 'n1' }),
      makeReminder('r2', { listId: 'list-1', notificationId: 'n2' }),
      makeReminder('r3', { listId: 'list-2', notificationId: 'n3' }),
    ])

    await ReminderOrchestrator.removeByListId('list-1')

    expect(cancelScheduled).toHaveBeenCalledWith('n1')
    expect(cancelScheduled).toHaveBeenCalledWith('n2')
    expect(useReminderStore.getState().getById('r1')).toBeUndefined()
    expect(useReminderStore.getState().getById('r2')).toBeUndefined()
    expect(useReminderStore.getState().getById('r3')).toBeDefined()
  })

  it('rescheduleReminder cobre ramos de ausência, desabilitado, sem permissão e agendamento', async () => {
    await ReminderOrchestrator.rescheduleReminder('missing')

    seedReminders([makeReminder('r1', { enabled: false, notificationId: 'n1' })])
    await ReminderOrchestrator.rescheduleReminder('r1')
    expect(useReminderStore.getState().getById('r1')?.notificationId).toBeUndefined()

    seedReminders([makeReminder('r2', { enabled: true, notificationId: 'n2' })])
    getPermissionState.mockResolvedValueOnce('denied')
    await ReminderOrchestrator.rescheduleReminder('r2')
    expect(useReminderStore.getState().getById('r2')?.notificationId).toBeUndefined()

    seedReminders([makeReminder('r3', { enabled: true, notificationId: 'n3' })])
    getPermissionState.mockResolvedValueOnce('granted')
    scheduleReminder.mockResolvedValueOnce('new-r3')
    await ReminderOrchestrator.rescheduleReminder('r3')
    expect(useReminderStore.getState().getById('r3')?.notificationId).toBe('new-r3')
  })

  it('syncWithPermissions limpa ids sem permissão e re-sincroniza com permissão', async () => {
    seedReminders([
      makeReminder('r1', { enabled: true, notificationId: 'n1' }),
      makeReminder('r2', { enabled: false, notificationId: 'n2' }),
    ])

    getPermissionState.mockResolvedValueOnce('denied')
    await ReminderOrchestrator.syncWithPermissions()
    expect(useReminderStore.getState().getById('r1')?.notificationId).toBeUndefined()
    expect(useReminderStore.getState().getById('r2')?.notificationId).toBeUndefined()

    seedReminders([
      makeReminder('r3', { enabled: false, notificationId: 'old3' }),
      makeReminder('r4', { enabled: true, notificationId: 'old4' }),
      makeReminder('r5', { enabled: true, notificationId: undefined }),
    ])

    getPermissionState.mockResolvedValueOnce('granted')
    scheduleReminder.mockResolvedValueOnce('new4').mockResolvedValueOnce('new5')

    await ReminderOrchestrator.syncWithPermissions()

    expect(cancelScheduled).toHaveBeenCalledWith('old3')
    expect(cancelScheduled).toHaveBeenCalledWith('old4')
    expect(useReminderStore.getState().getById('r3')?.notificationId).toBeUndefined()
    expect(useReminderStore.getState().getById('r4')?.notificationId).toBe('new4')
    expect(useReminderStore.getState().getById('r5')?.notificationId).toBe('new5')
  })

  it('cleanupOrphans remove lembretes de listas inválidas', async () => {
    seedReminders([
      makeReminder('r1', { listId: 'list-1', notificationId: 'n1' }),
      makeReminder('r2', { listId: 'list-2', notificationId: 'n2' }),
    ])

    await ReminderOrchestrator.cleanupOrphans(['list-2'])

    expect(cancelScheduled).toHaveBeenCalledWith('n1')
    expect(useReminderStore.getState().getById('r1')).toBeUndefined()
    expect(useReminderStore.getState().getById('r2')).toBeDefined()
  })

  it('saveReminder solicita permissão ao criar e alerta quando negada', async () => {
    ensurePermissionForScheduling.mockResolvedValueOnce(false)

    await expect(
      ReminderOrchestrator.saveReminder({
        listId: 'list-1',
        title: 'Comprar pão',
        dateValue: '2099-01-01',
        timeValue: '10:00',
        editingId: null,
      }),
    ).resolves.toBe(true)

    expect(ensurePermissionForScheduling).toHaveBeenCalledTimes(1)
    expect(alertOk).toHaveBeenCalledTimes(1)
    expect(scheduleReminder).not.toHaveBeenCalled()
    expect(useReminderStore.getState().reminders).toHaveLength(1)
    expect(useReminderStore.getState().reminders[0]?.notificationId).toBeUndefined()
  })

  it('saveReminder solicita permissão ao editar lembrete ativo e agenda quando concedida', async () => {
    seedReminders([makeReminder('r1', { enabled: true, notificationId: 'old-id' })])
    ensurePermissionForScheduling.mockResolvedValueOnce(true)
    getPermissionState.mockResolvedValueOnce('granted')
    scheduleReminder.mockResolvedValueOnce('new-id')

    await expect(
      ReminderOrchestrator.saveReminder({
        listId: 'list-1',
        title: 'Comprar arroz',
        dateValue: '2099-01-01',
        timeValue: '11:30',
        editingId: 'r1',
      }),
    ).resolves.toBe(true)

    expect(ensurePermissionForScheduling).toHaveBeenCalledTimes(1)
    expect(cancelScheduled).toHaveBeenCalledWith('old-id')
    expect(scheduleReminder).toHaveBeenCalledTimes(1)
    expect(alertOk).not.toHaveBeenCalled()
    expect(useReminderStore.getState().getById('r1')?.notificationId).toBe('new-id')
  })
})
