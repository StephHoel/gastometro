import { PermissionState } from '@/enums/PermissionState'
import type { ReminderProps } from '@/interfaces/ReminderProps'
import { NotificationService } from '@/services/NotificationService'
import * as Notifications from 'expo-notifications'
import { IsWeb } from '@/utils/platform'

jest.mock('@/utils/platform', () => ({
  IsWeb: jest.fn(),
}))

function makeReminder(overrides: Partial<ReminderProps> = {}): ReminderProps {
  return {
    id: 'rem-1',
    title: 'Comprar leite',
    datetimeISO: '2099-01-01T12:00:00.000Z',
    enabled: true,
    listId: 'list-1',
    createdAt: '2099-01-01T10:00:00.000Z',
    updatedAt: '2099-01-01T10:00:00.000Z',
    ...overrides,
  }
}

describe('NotificationService', () => {
  const mockedIsWeb = IsWeb as jest.Mock
  const getPermissionsAsync = Notifications.getPermissionsAsync as jest.Mock
  const requestPermissionsAsync = Notifications.requestPermissionsAsync as jest.Mock
  const scheduleNotificationAsync = Notifications.scheduleNotificationAsync as jest.Mock
  const cancelScheduledNotificationAsync = Notifications.cancelScheduledNotificationAsync as jest.Mock
  const dismissAllNotificationsAsync = Notifications.dismissAllNotificationsAsync as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockedIsWeb.mockReturnValue(false)
  })

  it('retorna unavailable no web para leitura de permissão', async () => {
    mockedIsWeb.mockReturnValue(true)

    await expect(NotificationService.getPermissionState()).resolves.toBe(PermissionState.Unavailable)
  })

  it('mapeia estados de permissão do dispositivo', async () => {
    getPermissionsAsync.mockResolvedValueOnce({ granted: true })
    await expect(NotificationService.getPermissionState()).resolves.toBe(PermissionState.Granted)

    getPermissionsAsync.mockResolvedValueOnce({ granted: false, status: Notifications.PermissionStatus.DENIED })
    await expect(NotificationService.getPermissionState()).resolves.toBe(PermissionState.Denied)

    getPermissionsAsync.mockResolvedValueOnce({ granted: false, status: 'undetermined' })
    await expect(NotificationService.getPermissionState()).resolves.toBe(PermissionState.Undetermined)
  })

  it('retorna unavailable quando falha ao ler permissão', async () => {
    getPermissionsAsync.mockRejectedValueOnce(new Error('falha'))

    await expect(NotificationService.getPermissionState()).resolves.toBe(PermissionState.Unavailable)
  })

  it('ensurePermissionForScheduling respeita web, grant atual e requisição', async () => {
    mockedIsWeb.mockReturnValue(true)
    await expect(NotificationService.ensurePermissionForScheduling()).resolves.toBe(false)

    mockedIsWeb.mockReturnValue(false)
    getPermissionsAsync.mockResolvedValueOnce({ granted: true })
    await expect(NotificationService.ensurePermissionForScheduling()).resolves.toBe(true)

    getPermissionsAsync.mockResolvedValueOnce({ granted: false })
    requestPermissionsAsync.mockResolvedValueOnce({ granted: true })
    await expect(NotificationService.ensurePermissionForScheduling()).resolves.toBe(true)
  })

  it('ensurePermissionForScheduling retorna false quando ocorre erro', async () => {
    getPermissionsAsync.mockRejectedValueOnce(new Error('sem acesso'))

    await expect(NotificationService.ensurePermissionForScheduling()).resolves.toBe(false)
  })

  it('scheduleReminder retorna null para web, data inválida ou passada', async () => {
    mockedIsWeb.mockReturnValue(true)
    await expect(NotificationService.scheduleReminder(makeReminder())).resolves.toBeNull()

    mockedIsWeb.mockReturnValue(false)
    await expect(NotificationService.scheduleReminder(makeReminder({ datetimeISO: 'inv' }))).resolves.toBeNull()
    await expect(NotificationService.scheduleReminder(makeReminder({ datetimeISO: '2001-01-01T00:00:00.000Z' }))).resolves.toBeNull()
  })

  it('scheduleReminder agenda e retorna id quando válido', async () => {
    scheduleNotificationAsync.mockResolvedValueOnce('notif-1')

    await expect(NotificationService.scheduleReminder(makeReminder())).resolves.toBe('notif-1')
    expect(scheduleNotificationAsync).toHaveBeenCalledTimes(1)
  })

  it('scheduleReminder retorna null quando API de agendamento falha', async () => {
    scheduleNotificationAsync.mockRejectedValueOnce(new Error('falha'))

    await expect(NotificationService.scheduleReminder(makeReminder())).resolves.toBeNull()
  })

  it('cancelScheduled ignora web/id vazio e cancela quando há id', async () => {
    mockedIsWeb.mockReturnValue(true)
    await NotificationService.cancelScheduled('notif-x')
    expect(cancelScheduledNotificationAsync).not.toHaveBeenCalled()

    mockedIsWeb.mockReturnValue(false)
    await NotificationService.cancelScheduled(undefined)
    expect(cancelScheduledNotificationAsync).not.toHaveBeenCalled()

    await NotificationService.cancelScheduled('notif-1')
    expect(cancelScheduledNotificationAsync).toHaveBeenCalledWith('notif-1')
  })

  it('cancelScheduled captura erro sem lançar', async () => {
    cancelScheduledNotificationAsync.mockRejectedValueOnce(new Error('erro'))

    await expect(NotificationService.cancelScheduled('notif-1')).resolves.toBeUndefined()
  })

  it('clearDeliveredNotifications ignora web e limpa notificações no mobile', async () => {
    mockedIsWeb.mockReturnValue(true)
    await NotificationService.clearDeliveredNotifications()
    expect(dismissAllNotificationsAsync).not.toHaveBeenCalled()

    mockedIsWeb.mockReturnValue(false)
    await NotificationService.clearDeliveredNotifications()
    expect(dismissAllNotificationsAsync).toHaveBeenCalledTimes(1)
  })

  it('clearDeliveredNotifications captura erro sem lançar', async () => {
    dismissAllNotificationsAsync.mockRejectedValueOnce(new Error('erro'))

    await expect(NotificationService.clearDeliveredNotifications()).resolves.toBeUndefined()
  })

  it('extrai listId e reminderId do payload de notificação', () => {
    expect(NotificationService.getListIdFromNotification(null)).toBeNull()
    expect(NotificationService.getListIdFromNotification({ listId: 1 })).toBeNull()
    expect(NotificationService.getListIdFromNotification({ listId: 'list-1' })).toBe('list-1')

    expect(NotificationService.getReminderIdFromNotification(undefined)).toBeNull()
    expect(NotificationService.getReminderIdFromNotification({ reminderId: 1 })).toBeNull()
    expect(NotificationService.getReminderIdFromNotification({ reminderId: 'rem-1' })).toBe('rem-1')
  })
})
