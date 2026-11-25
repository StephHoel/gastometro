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

describe('ReminderOrchestrator - recuperação de permissões', () => {
  const getPermissionState = NotificationService.getPermissionState as jest.Mock
  const getScheduled = NotificationService.getScheduledReminderNotifications as jest.Mock
  const cancelScheduled = NotificationService.cancelScheduled as jest.Mock
  const scheduleReminder = NotificationService.scheduleReminder as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    useReminderStore.setState({
      reminders: [{
        id: 'rem-1',
        title: 'Comprar leite',
        datetimeISO: '2099-01-01T10:00:00.000Z',
        enabled: true,
        listId: 'list-1',
        notificationId: 'native-old',
        createdAt: '2098-01-01T10:00:00.000Z',
        updatedAt: '2098-01-01T10:00:00.000Z',
      }],
    })
    getPermissionState.mockResolvedValue(PermissionState.Granted)
    getScheduled.mockResolvedValue([])
    cancelScheduled.mockResolvedValue(undefined)
    scheduleReminder.mockResolvedValue('native-new')
  })

  it('remove o agendamento quando a permissão é revogada e recupera quando volta a ser concedida', async () => {
    getPermissionState.mockResolvedValueOnce(PermissionState.Denied)
    getScheduled.mockResolvedValueOnce([{
      notificationId: 'native-old',
      reminderId: 'rem-1',
      listId: 'list-1',
      title: 'Comprar leite',
      datetimeISO: '2099-01-01T10:00:00.000Z',
    }])

    await ReminderOrchestrator.syncWithPermissions()

    expect(cancelScheduled).toHaveBeenCalledWith('native-old')
    expect(useReminderStore.getState().getById('rem-1')?.notificationId).toBeUndefined()
    expect(scheduleReminder).not.toHaveBeenCalled()

    await ReminderOrchestrator.syncWithPermissions()

    expect(scheduleReminder).toHaveBeenCalledTimes(1)
    expect(useReminderStore.getState().getById('rem-1')?.notificationId).toBe('native-new')
  })

  it('não altera os IDs persistidos quando o estado da permissão não pode ser consultado', async () => {
    getPermissionState.mockResolvedValueOnce(PermissionState.Unavailable)

    await ReminderOrchestrator.syncWithPermissions()

    expect(getScheduled).not.toHaveBeenCalled()
    expect(cancelScheduled).not.toHaveBeenCalled()
    expect(scheduleReminder).not.toHaveBeenCalled()
    expect(useReminderStore.getState().getById('rem-1')?.notificationId).toBe('native-old')
  })
})
