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

const scheduled = (
  notificationId: string,
  reminderId: string,
  overrides: Record<string, unknown> = {},
) => ({
  notificationId,
  reminderId,
  listId: 'list-1',
  title: 'Comprar leite',
  datetimeISO: '2099-01-01T10:00:00.000Z',
  ...overrides,
})

function makeReminder(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    title: 'Comprar leite',
    datetimeISO: '2099-01-01T10:00:00.000Z',
    enabled: true,
    listId: 'list-1',
    notificationId: 'persisted-id',
    createdAt: '2098-01-01T10:00:00.000Z',
    updatedAt: '2098-01-01T10:00:00.000Z',
    ...overrides,
  }
}

function seedReminders(reminders: ReturnType<typeof makeReminder>[]) {
  useReminderStore.setState({ reminders: reminders as never[] })
}

describe('ReminderOrchestrator - sincronização individual', () => {
  const cancelScheduled = NotificationService.cancelScheduled as jest.Mock
  const scheduleReminder = NotificationService.scheduleReminder as jest.Mock
  const getPermissionState = NotificationService.getPermissionState as jest.Mock
  const getScheduled = NotificationService.getScheduledReminderNotifications as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    useReminderStore.setState({ reminders: [] })
    cancelScheduled.mockResolvedValue(undefined)
    scheduleReminder.mockResolvedValue('new-native-id')
    getPermissionState.mockResolvedValue(PermissionState.Granted)
    getScheduled.mockResolvedValue([])
  })

  it('preserva o agendamento válido e não altera outros lembretes', async () => {
    seedReminders([
      makeReminder('rem-1', { notificationId: 'native-1' }),
      makeReminder('rem-2', { notificationId: 'native-2', title: 'Comprar pão' }),
    ])
    getScheduled.mockResolvedValueOnce([
      scheduled('native-1', 'rem-1'),
      scheduled('native-2', 'rem-2', { title: 'Comprar pão' }),
    ])

    await ReminderOrchestrator.syncReminder('rem-1')

    expect(cancelScheduled).not.toHaveBeenCalled()
    expect(scheduleReminder).not.toHaveBeenCalled()
    expect(useReminderStore.getState().getById('rem-2')?.notificationId).toBe('native-2')
  })

  it('substitui somente o agendamento do lembrete solicitado quando seus dados mudam', async () => {
    seedReminders([
      makeReminder('rem-1', { title: 'Comprar arroz', notificationId: 'old-rem-1' }),
      makeReminder('rem-2', { title: 'Comprar pão', notificationId: 'native-2' }),
    ])
    getScheduled.mockResolvedValueOnce([
      scheduled('old-rem-1', 'rem-1', { title: 'Comprar leite' }),
      scheduled('native-2', 'rem-2', { title: 'Comprar pão' }),
    ])

    await ReminderOrchestrator.syncReminder('rem-1')

    expect(cancelScheduled).toHaveBeenCalledTimes(1)
    expect(cancelScheduled).toHaveBeenCalledWith('old-rem-1')
    expect(scheduleReminder).toHaveBeenCalledTimes(1)
    expect(scheduleReminder).toHaveBeenCalledWith(expect.objectContaining({
      id: 'rem-1',
      title: 'Comprar arroz',
    }))
    expect(useReminderStore.getState().getById('rem-2')?.notificationId).toBe('native-2')
  })

  it('cancela apenas o agendamento do lembrete desabilitado', async () => {
    seedReminders([
      makeReminder('rem-1', { enabled: false }),
      makeReminder('rem-2', { notificationId: 'native-2' }),
    ])
    getScheduled.mockResolvedValueOnce([
      scheduled('native-1', 'rem-1'),
      scheduled('native-2', 'rem-2', { title: 'Comprar pão' }),
    ])

    await ReminderOrchestrator.syncReminder('rem-1')

    expect(cancelScheduled).toHaveBeenCalledTimes(2)
    expect(cancelScheduled).toHaveBeenCalledWith('native-1')
    expect(cancelScheduled).toHaveBeenCalledWith('persisted-id')
    expect(scheduleReminder).not.toHaveBeenCalled()
    expect(useReminderStore.getState().getById('rem-2')?.notificationId).toBe('native-2')
  })


  it('desabilita e cancela todos os agendamentos mesmo se a leitura de permissão estiver indisponível', async () => {
    seedReminders([makeReminder('rem-1')])
    getScheduled.mockResolvedValueOnce([
      scheduled('native-1', 'rem-1'),
      scheduled('native-duplicate', 'rem-1'),
    ])

    await ReminderOrchestrator.disableReminder('rem-1')

    expect(getPermissionState).not.toHaveBeenCalled()
    expect(cancelScheduled).toHaveBeenCalledWith('persisted-id')
    expect(cancelScheduled).toHaveBeenCalledWith('native-1')
    expect(cancelScheduled).toHaveBeenCalledWith('native-duplicate')
    expect(useReminderStore.getState().getById('rem-1')?.enabled).toBe(false)
    expect(useReminderStore.getState().getById('rem-1')?.notificationId).toBeUndefined()
  })

  it('não modifica IDs persistidos quando a permissão está indisponível', async () => {
    seedReminders([makeReminder('rem-1')])
    getPermissionState.mockResolvedValueOnce(PermissionState.Unavailable)

    await ReminderOrchestrator.syncReminder('rem-1')

    expect(getScheduled).not.toHaveBeenCalled()
    expect(cancelScheduled).not.toHaveBeenCalled()
    expect(scheduleReminder).not.toHaveBeenCalled()
    expect(useReminderStore.getState().getById('rem-1')?.notificationId).toBe('persisted-id')
  })

  it('remove agendamentos órfãos do lembrete direcionado que já foi removido', async () => {
    getScheduled.mockResolvedValueOnce([
      scheduled('orphan-1', 'rem-removed'),
      scheduled('orphan-2', 'rem-removed'),
      scheduled('unrelated', 'rem-other'),
    ])

    await ReminderOrchestrator.syncReminder('rem-removed')

    expect(cancelScheduled).toHaveBeenCalledTimes(2)
    expect(cancelScheduled).toHaveBeenCalledWith('orphan-1')
    expect(cancelScheduled).toHaveBeenCalledWith('orphan-2')
    expect(cancelScheduled).not.toHaveBeenCalledWith('unrelated')
  })

  it('preserva o lembrete quando o agendamento individual falha', async () => {
    seedReminders([makeReminder('rem-1')])
    scheduleReminder.mockResolvedValueOnce(null)

    await ReminderOrchestrator.syncReminder('rem-1')

    expect(useReminderStore.getState().getById('rem-1')).toBeDefined()
    expect(useReminderStore.getState().getById('rem-1')?.notificationId).toBeUndefined()
  })

  it('descarta um ID retornado para dados obsoletos e agenda novamente a versão mais recente', async () => {
    seedReminders([makeReminder('rem-1')])
    let finishSchedule: ((notificationId: string) => void) | undefined
    scheduleReminder
      .mockImplementationOnce(() => new Promise<string>((resolve) => { finishSchedule = resolve }))
      .mockResolvedValueOnce('fresh-native-id')

    const sync = ReminderOrchestrator.syncReminder('rem-1')
    await new Promise((resolve) => setTimeout(resolve, 0))

    useReminderStore.setState({
      reminders: [makeReminder('rem-1', { title: 'Comprar arroz', notificationId: undefined })] as never[],
    })
    finishSchedule?.('stale-native-id')

    await sync

    expect(cancelScheduled).toHaveBeenCalledWith('stale-native-id')
    expect(scheduleReminder).toHaveBeenCalledTimes(2)
    expect(scheduleReminder).toHaveBeenLastCalledWith(expect.objectContaining({
      id: 'rem-1',
      title: 'Comprar arroz',
    }))
    expect(useReminderStore.getState().getById('rem-1')?.notificationId).toBe('fresh-native-id')
  })

  it('cancela o agendamento que termina depois que o lembrete foi removido', async () => {
    seedReminders([makeReminder('rem-1')])
    let finishSchedule: ((notificationId: string) => void) | undefined
    scheduleReminder.mockImplementationOnce(
      () => new Promise<string>((resolve) => { finishSchedule = resolve }),
    )

    const sync = ReminderOrchestrator.syncReminder('rem-1')
    await new Promise((resolve) => setTimeout(resolve, 0))
    useReminderStore.setState({ reminders: [] })
    finishSchedule?.('late-native-id')

    await sync

    expect(cancelScheduled).toHaveBeenCalledWith('late-native-id')
    expect(useReminderStore.getState().getById('rem-1')).toBeUndefined()
  })

  it('consolida solicitações simultâneas para o mesmo lembrete sem duplicar o agendamento', async () => {
    seedReminders([makeReminder('rem-1', { notificationId: undefined })])
    let finishSchedule: ((notificationId: string) => void) | undefined
    scheduleReminder.mockImplementationOnce(
      () => new Promise<string>((resolve) => { finishSchedule = resolve }),
    )
    getScheduled
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([scheduled('created-native-id', 'rem-1')])

    const first = ReminderOrchestrator.syncReminder('rem-1')
    const second = ReminderOrchestrator.syncReminder('rem-1')
    await new Promise((resolve) => setTimeout(resolve, 0))
    finishSchedule?.('created-native-id')

    await Promise.all([first, second])

    expect(scheduleReminder).toHaveBeenCalledTimes(1)
    expect(cancelScheduled).not.toHaveBeenCalled()
    expect(useReminderStore.getState().getById('rem-1')?.notificationId).toBe('created-native-id')
  })
})
