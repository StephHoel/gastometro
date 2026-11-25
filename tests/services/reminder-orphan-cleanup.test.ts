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

const makeReminder = (id: string, listId: string, notificationId?: string) => ({
  id,
  title: `Lembrete ${id}`,
  datetimeISO: '2099-01-01T10:00:00.000Z',
  enabled: true,
  listId,
  notificationId,
  createdAt: '2098-01-01T10:00:00.000Z',
  updatedAt: '2098-01-01T10:00:00.000Z',
})

describe('ReminderOrchestrator - limpeza de órfãos', () => {
  const getScheduled = NotificationService.getScheduledReminderNotifications as jest.Mock
  const cancelScheduled = NotificationService.cancelScheduled as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    useReminderStore.setState({ reminders: [] })
    getScheduled.mockResolvedValue([])
    cancelScheduled.mockResolvedValue(undefined)
  })

  it('cancela todos os agendamentos órfãos sem afetar lembretes de listas válidas', async () => {
    useReminderStore.setState({
      reminders: [
        makeReminder('rem-1', 'removed-list-1', 'persisted-1'),
        makeReminder('rem-2', 'removed-list-2'),
        makeReminder('rem-valid', 'valid-list', 'valid-native'),
      ] as never[],
    })
    getScheduled.mockResolvedValue([
      { notificationId: 'native-1', reminderId: 'rem-1' },
      { notificationId: 'native-1-extra', reminderId: 'rem-1' },
      { notificationId: 'native-2', reminderId: 'rem-2' },
      { notificationId: 'valid-native', reminderId: 'rem-valid' },
      { notificationId: 'unrelated', reminderId: null },
    ])

    await ReminderOrchestrator.cleanupOrphans(['valid-list'])

    expect(cancelScheduled).toHaveBeenCalledWith('persisted-1')
    expect(cancelScheduled).toHaveBeenCalledWith('native-1-extra')
    expect(cancelScheduled).toHaveBeenCalledWith('native-2')
    expect(cancelScheduled).not.toHaveBeenCalledWith('valid-native')
    expect(cancelScheduled).not.toHaveBeenCalledWith('unrelated')
    expect(useReminderStore.getState().getById('rem-1')).toBeUndefined()
    expect(useReminderStore.getState().getById('rem-2')).toBeUndefined()
    expect(useReminderStore.getState().getById('rem-valid')).toBeDefined()
  })

  it('preserva o registro órfão para nova tentativa quando não consegue consultar os agendamentos', async () => {
    useReminderStore.setState({
      reminders: [makeReminder('rem-1', 'removed-list', 'persisted-1')] as never[],
    })
    getScheduled.mockResolvedValueOnce(null)

    await expect(ReminderOrchestrator.cleanupOrphans([])).resolves.toBe(false)

    expect(cancelScheduled).toHaveBeenCalledWith('persisted-1')
    expect(useReminderStore.getState().getById('rem-1')).toBeDefined()
  })

  it('continua a limpeza dos demais lembretes quando um cancelamento falha', async () => {
    useReminderStore.setState({
      reminders: [
        makeReminder('rem-1', 'removed-list', 'native-1'),
        makeReminder('rem-2', 'removed-list', 'native-2'),
      ] as never[],
    })
    cancelScheduled.mockRejectedValueOnce(new Error('falha ao cancelar'))
    getScheduled.mockResolvedValue([])

    await expect(ReminderOrchestrator.cleanupOrphans([])).resolves.toBe(true)

    expect(cancelScheduled).toHaveBeenCalledWith('native-1')
    expect(cancelScheduled).toHaveBeenCalledWith('native-2')
    expect(useReminderStore.getState().reminders).toHaveLength(0)
  })

  it('remove os lembretes de uma lista somente depois de processar seus agendamentos', async () => {
    useReminderStore.setState({
      reminders: [
        makeReminder('rem-1', 'list-1', 'native-1'),
        makeReminder('rem-2', 'list-1', 'native-2'),
        makeReminder('rem-3', 'list-2', 'native-3'),
      ] as never[],
    })

    await ReminderOrchestrator.removeByListId('list-1')

    expect(cancelScheduled).toHaveBeenCalledWith('native-1')
    expect(cancelScheduled).toHaveBeenCalledWith('native-2')
    expect(useReminderStore.getState().getById('rem-1')).toBeUndefined()
    expect(useReminderStore.getState().getById('rem-2')).toBeUndefined()
    expect(useReminderStore.getState().getById('rem-3')).toBeDefined()
  })
})
