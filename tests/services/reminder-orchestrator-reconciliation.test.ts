import { PermissionState } from '@/enums/PermissionState'
import { ReminderOrchestrator } from '@/services/ReminderOrchestrator'
import { NotificationService } from '@/services/NotificationService'
import { useReminderStore } from '@/stores/ReminderStore'

jest.mock('@/services/AlertService', () => ({
  AlertService: { ok: jest.fn() },
}))

jest.mock('@/services/NotificationService', () => ({
  NotificationService: {
    ensurePermissionForScheduling: jest.fn(),
    cancelScheduled: jest.fn(),
    scheduleReminder: jest.fn(),
    getPermissionState: jest.fn(),
    getScheduledReminderNotifications: jest.fn(),
  },
}))

const notification = (notificationId: string, reminderId: string | null = 'rem-1') => ({
  notificationId,
  reminderId,
  listId: 'list-1',
  title: 'Comprar leite',
  datetimeISO: '2099-01-01T10:00:00.000Z',
})

function seedReminder(overrides: Record<string, unknown> = {}) {
  useReminderStore.setState({
    reminders: [{
      id: 'rem-1',
      title: 'Comprar leite',
      datetimeISO: '2099-01-01T10:00:00.000Z',
      enabled: true,
      listId: 'list-1',
      notificationId: 'persisted-id',
      createdAt: '2098-01-01T10:00:00.000Z',
      updatedAt: '2098-01-01T10:00:00.000Z',
      ...overrides,
    }] as never[],
  })
}

describe('ReminderOrchestrator - reconciliação adicional', () => {
  const cancelScheduled = NotificationService.cancelScheduled as jest.Mock
  const scheduleReminder = NotificationService.scheduleReminder as jest.Mock
  const getPermissionState = NotificationService.getPermissionState as jest.Mock
  const getScheduledReminderNotifications = NotificationService.getScheduledReminderNotifications as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    useReminderStore.setState({ reminders: [] })
    cancelScheduled.mockResolvedValue(undefined)
    scheduleReminder.mockResolvedValue('new-native-id')
    getPermissionState.mockResolvedValue(PermissionState.Granted)
    getScheduledReminderNotifications.mockResolvedValue([])
  })

  it('não consulta agendamentos nem altera dados quando notificações estão indisponíveis', async () => {
    seedReminder()
    getPermissionState.mockResolvedValueOnce(PermissionState.Unavailable)

    await ReminderOrchestrator.syncWithPermissions()

    expect(getScheduledReminderNotifications).not.toHaveBeenCalled()
    expect(cancelScheduled).not.toHaveBeenCalled()
    expect(scheduleReminder).not.toHaveBeenCalled()
    expect(useReminderStore.getState().getById('rem-1')?.notificationId).toBe('persisted-id')
  })

  it('interrompe a reconciliação quando a consulta de agendamentos falha', async () => {
    seedReminder()
    getScheduledReminderNotifications.mockResolvedValueOnce(null)

    await ReminderOrchestrator.syncWithPermissions()

    expect(cancelScheduled).not.toHaveBeenCalled()
    expect(scheduleReminder).not.toHaveBeenCalled()
    expect(useReminderStore.getState().getById('rem-1')?.notificationId).toBe('persisted-id')
  })

  it('cancela agendamentos encontrados e identificador persistido quando a permissão é negada', async () => {
    seedReminder()
    getPermissionState.mockResolvedValueOnce(PermissionState.Denied)
    getScheduledReminderNotifications.mockResolvedValueOnce([
      notification('native-1'),
      notification('native-2'),
    ])

    await ReminderOrchestrator.syncWithPermissions()

    expect(cancelScheduled).toHaveBeenCalledTimes(3)
    expect(cancelScheduled).toHaveBeenNthCalledWith(1, 'native-1')
    expect(cancelScheduled).toHaveBeenNthCalledWith(2, 'native-2')
    expect(cancelScheduled).toHaveBeenNthCalledWith(3, 'persisted-id')
    expect(scheduleReminder).not.toHaveBeenCalled()
    expect(useReminderStore.getState().getById('rem-1')?.notificationId).toBeUndefined()
  })

  it('não agenda lembrete desabilitado e limpa referências nativas antigas', async () => {
    seedReminder({ enabled: false })
    getScheduledReminderNotifications.mockResolvedValueOnce([
      notification('native-1'),
    ])

    await ReminderOrchestrator.syncWithPermissions()

    expect(cancelScheduled).toHaveBeenCalledWith('native-1')
    expect(cancelScheduled).toHaveBeenCalledWith('persisted-id')
    expect(scheduleReminder).not.toHaveBeenCalled()
    expect(useReminderStore.getState().getById('rem-1')?.notificationId).toBeUndefined()
  })

  it('substitui agendamento incompatível e preserva o lembrete se o novo agendamento falhar', async () => {
    seedReminder({ datetimeISO: 'data-invalida' })
    getScheduledReminderNotifications.mockResolvedValueOnce([
      notification('outdated-native-id'),
    ])
    scheduleReminder.mockResolvedValueOnce(null)

    await expect(ReminderOrchestrator.syncWithPermissions()).resolves.toBe(false)

    expect(cancelScheduled).toHaveBeenCalledWith('outdated-native-id')
    expect(cancelScheduled).toHaveBeenCalledWith('persisted-id')
    expect(scheduleReminder).toHaveBeenCalledWith(expect.objectContaining({
      id: 'rem-1',
      datetimeISO: 'data-invalida',
      notificationId: undefined,
    }))
    expect(useReminderStore.getState().getById('rem-1')).toBeDefined()
    expect(useReminderStore.getState().getById('rem-1')?.notificationId).toBeUndefined()
  })

  it('remove todos os agendamentos do lembrete sem cancelar duas vezes o mesmo identificador', async () => {
    seedReminder()
    getScheduledReminderNotifications.mockResolvedValueOnce([
      notification('persisted-id'),
      notification('additional-native-id'),
    ])

    await ReminderOrchestrator.removeReminder('rem-1')

    expect(cancelScheduled).toHaveBeenCalledTimes(2)
    expect(cancelScheduled).toHaveBeenNthCalledWith(1, 'persisted-id')
    expect(cancelScheduled).toHaveBeenNthCalledWith(2, 'additional-native-id')
    expect(useReminderStore.getState().getById('rem-1')).toBeUndefined()
  })

  it('remove o lembrete mesmo quando não consegue consultar outros agendamentos nativos', async () => {
    seedReminder()
    getScheduledReminderNotifications.mockRejectedValueOnce(new Error('consulta indisponível'))

    await ReminderOrchestrator.removeReminder('rem-1')

    expect(cancelScheduled).toHaveBeenCalledWith('persisted-id')
    expect(useReminderStore.getState().getById('rem-1')).toBeUndefined()
  })

  it('limpa lembretes órfãos mesmo quando não há identificador nativo persistido', async () => {
    seedReminder({ notificationId: undefined })

    await ReminderOrchestrator.cleanupOrphans([])

    expect(getScheduledReminderNotifications).toHaveBeenCalledTimes(1)
    expect(cancelScheduled).not.toHaveBeenCalled()
    expect(useReminderStore.getState().getById('rem-1')).toBeUndefined()
  })
})


describe('ReminderOrchestrator - divergências de agendamento', () => {
  const cancelScheduled = NotificationService.cancelScheduled as jest.Mock
  const scheduleReminder = NotificationService.scheduleReminder as jest.Mock
  const getScheduledReminderNotifications = NotificationService.getScheduledReminderNotifications as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    useReminderStore.setState({ reminders: [] })
    cancelScheduled.mockResolvedValue(undefined)
    scheduleReminder.mockResolvedValue('replacement-id')
    ;(NotificationService.getPermissionState as jest.Mock).mockResolvedValue(PermissionState.Granted)
    getScheduledReminderNotifications.mockResolvedValue([])
  })

  it.each([
    ['título', { title: 'Título antigo' }],
    ['lista', { listId: 'old-list' }],
    ['data e hora', { datetimeISO: '2099-01-02T10:00:00.000Z' }],
  ])('substitui agendamento divergente no campo %s', async (_field, changes) => {
    seedReminder()
    getScheduledReminderNotifications.mockResolvedValueOnce([
      { ...notification('outdated-id'), ...changes },
    ])

    await ReminderOrchestrator.syncWithPermissions()

    expect(cancelScheduled).toHaveBeenCalledWith('outdated-id')
    expect(scheduleReminder).toHaveBeenCalledTimes(1)
    expect(useReminderStore.getState().getById('rem-1')?.notificationId).toBe('replacement-id')
  })
  it('informa falha quando não consegue cancelar um agendamento antigo', async () => {
    seedReminder()
    getScheduledReminderNotifications.mockResolvedValueOnce([
      { ...notification('outdated-native-id'), title: 'Título antigo' },
    ])
    cancelScheduled.mockResolvedValue(false)

    await expect(ReminderOrchestrator.syncWithPermissions()).resolves.toBe(false)
  })

})
