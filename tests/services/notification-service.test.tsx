import { PermissionState } from '@/enums/PermissionState'
import type { ReminderProps } from '@/interfaces/ReminderProps'
import { NotificationService } from '@/services/NotificationService'
import { IsWeb } from '@/utils/platform'
import { cancelScheduledNotificationAsync, dismissAllNotificationsAsync, getAllScheduledNotificationsAsync, getPermissionsAsync, PermissionStatus, requestPermissionsAsync, scheduleNotificationAsync } from 'expo-notifications'

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
  const getPermissionsAsyncMock = getPermissionsAsync as jest.Mock
  const requestPermissionsAsyncMock = requestPermissionsAsync as jest.Mock
  const scheduleNotificationAsyncMock = scheduleNotificationAsync as jest.Mock
  const cancelScheduledNotificationAsyncMock = cancelScheduledNotificationAsync as jest.Mock
  const dismissAllNotificationsAsyncMock = dismissAllNotificationsAsync as jest.Mock
  const getAllScheduledNotificationsAsyncMock = getAllScheduledNotificationsAsync as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockedIsWeb.mockReturnValue(false)
  })

  it('retorna unavailable no web para leitura de permissão', async () => {
    mockedIsWeb.mockReturnValue(true)

    await expect(NotificationService.getPermissionState()).resolves.toBe(PermissionState.Unavailable)
  })

  it('mapeia estados de permissão do dispositivo', async () => {
    getPermissionsAsyncMock.mockResolvedValueOnce({ granted: true })
    await expect(NotificationService.getPermissionState()).resolves.toBe(PermissionState.Granted)

    getPermissionsAsyncMock.mockResolvedValueOnce({ granted: false, status: PermissionStatus.DENIED })
    await expect(NotificationService.getPermissionState()).resolves.toBe(PermissionState.Denied)

    getPermissionsAsyncMock.mockResolvedValueOnce({ granted: false, status: 'undetermined' })
    await expect(NotificationService.getPermissionState()).resolves.toBe(PermissionState.Undetermined)
  })

  it('retorna unavailable quando falha ao ler permissão', async () => {
    getPermissionsAsyncMock.mockRejectedValueOnce(new Error('falha'))

    await expect(NotificationService.getPermissionState()).resolves.toBe(PermissionState.Unavailable)
  })

  it('ensurePermissionForScheduling respeita web, grant atual e requisição', async () => {
    mockedIsWeb.mockReturnValue(true)
    await expect(NotificationService.ensurePermissionForScheduling()).resolves.toBe(false)

    mockedIsWeb.mockReturnValue(false)
    getPermissionsAsyncMock.mockResolvedValueOnce({ granted: true })
    await expect(NotificationService.ensurePermissionForScheduling()).resolves.toBe(true)

    getPermissionsAsyncMock.mockResolvedValueOnce({ granted: false })
    requestPermissionsAsyncMock.mockResolvedValueOnce({ granted: true })
    await expect(NotificationService.ensurePermissionForScheduling()).resolves.toBe(true)
  })

  it('ensurePermissionForScheduling retorna false quando ocorre erro', async () => {
    getPermissionsAsyncMock.mockRejectedValueOnce(new Error('sem acesso'))

    await expect(NotificationService.ensurePermissionForScheduling()).resolves.toBe(false)
  })

  it('consulta os agendamentos nativos e extrai os dados dos lembretes', async () => {
    getAllScheduledNotificationsAsyncMock.mockResolvedValueOnce([{
      identifier: 'native-1',
      content: {
        title: 'Comprar leite',
        data: { reminderId: 'rem-1', listId: 'list-1' },
      },
      trigger: { date: new Date('2099-01-01T12:00:00.000Z') },
    }])

    await expect(NotificationService.getScheduledReminderNotifications()).resolves.toEqual([{
      notificationId: 'native-1',
      reminderId: 'rem-1',
      listId: 'list-1',
      title: 'Comprar leite',
      datetimeISO: '2099-01-01T12:00:00.000Z',
    }])
  })

  it('não consulta agendamentos no web e sinaliza falha na consulta nativa', async () => {
    mockedIsWeb.mockReturnValue(true)
    await expect(NotificationService.getScheduledReminderNotifications()).resolves.toEqual([])
    expect(getAllScheduledNotificationsAsyncMock).not.toHaveBeenCalled()

    mockedIsWeb.mockReturnValue(false)
    getAllScheduledNotificationsAsyncMock.mockRejectedValueOnce(new Error('falha'))
    await expect(NotificationService.getScheduledReminderNotifications()).resolves.toBeNull()
  })

  it('scheduleReminder retorna null para web, data inválida ou passada', async () => {
    mockedIsWeb.mockReturnValue(true)
    await expect(NotificationService.scheduleReminder(makeReminder())).resolves.toBeNull()

    mockedIsWeb.mockReturnValue(false)
    await expect(NotificationService.scheduleReminder(makeReminder({ datetimeISO: 'inv' }))).resolves.toBeNull()
    await expect(NotificationService.scheduleReminder(makeReminder({ datetimeISO: '2001-01-01T00:00:00.000Z' }))).resolves.toBeNull()
  })

  it('scheduleReminder agenda e retorna id quando válido', async () => {
    scheduleNotificationAsyncMock.mockResolvedValueOnce('notif-1')

    await expect(NotificationService.scheduleReminder(makeReminder())).resolves.toBe('notif-1')
    expect(scheduleNotificationAsyncMock).toHaveBeenCalledTimes(1)
  })

  it('scheduleReminder retorna null quando API de agendamento falha', async () => {
    scheduleNotificationAsyncMock.mockRejectedValueOnce(new Error('falha'))

    await expect(NotificationService.scheduleReminder(makeReminder())).resolves.toBeNull()
  })

  it('cancelScheduled ignora web/id vazio e cancela quando há id', async () => {
    mockedIsWeb.mockReturnValue(true)
    await NotificationService.cancelScheduled('notif-x')
    expect(cancelScheduledNotificationAsyncMock).not.toHaveBeenCalled()

    mockedIsWeb.mockReturnValue(false)
    await NotificationService.cancelScheduled(undefined)
    expect(cancelScheduledNotificationAsyncMock).not.toHaveBeenCalled()

    await NotificationService.cancelScheduled('notif-1')
    expect(cancelScheduledNotificationAsyncMock).toHaveBeenCalledWith('notif-1')
  })

  it('cancelScheduled captura erro sem lançar', async () => {
    cancelScheduledNotificationAsyncMock.mockRejectedValueOnce(new Error('erro'))

    await expect(NotificationService.cancelScheduled('notif-1')).resolves.toBe(false)
  })

  it('clearDeliveredNotifications ignora web e limpa notificações no mobile', async () => {
    mockedIsWeb.mockReturnValue(true)
    await NotificationService.clearDeliveredNotifications()
    expect(dismissAllNotificationsAsyncMock).not.toHaveBeenCalled()

    mockedIsWeb.mockReturnValue(false)
    await NotificationService.clearDeliveredNotifications()
    expect(dismissAllNotificationsAsyncMock).toHaveBeenCalledTimes(1)
  })

  it('clearDeliveredNotifications captura erro sem lançar', async () => {
    dismissAllNotificationsAsyncMock.mockRejectedValueOnce(new Error('erro'))

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


describe('NotificationService - formatos e permissões adicionais', () => {
  const mockedIsWeb = IsWeb as jest.Mock
  const getAllScheduledNotifications = getAllScheduledNotificationsAsync as jest.Mock
  const getPermissions = getPermissionsAsync as jest.Mock
  const requestPermissions = requestPermissionsAsync as jest.Mock
  const scheduleNotification = scheduleNotificationAsync as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockedIsWeb.mockReturnValue(false)
  })

  it('retorna metadados nulos quando o agendamento não possui data ou payload reconhecível', async () => {
    getAllScheduledNotifications.mockResolvedValueOnce([
      {
        identifier: 'without-trigger',
        content: { title: null, data: null },
        trigger: null,
      },
      {
        identifier: 'invalid-date',
        content: { title: 'Aviso', data: { reminderId: 10, listId: false } },
        trigger: { date: 'data-inválida' },
      },
    ])

    await expect(NotificationService.getScheduledReminderNotifications()).resolves.toEqual([
      {
        notificationId: 'without-trigger',
        reminderId: null,
        listId: null,
        title: null,
        datetimeISO: null,
      },
      {
        notificationId: 'invalid-date',
        reminderId: null,
        listId: null,
        title: 'Aviso',
        datetimeISO: null,
      },
    ])
  })

  it('retorna false quando o usuário nega a solicitação de permissão', async () => {
    getPermissions.mockResolvedValueOnce({ granted: false })
    requestPermissions.mockResolvedValueOnce({ granted: false })

    await expect(NotificationService.ensurePermissionForScheduling()).resolves.toBe(false)
    expect(requestPermissions).toHaveBeenCalledTimes(1)
  })

  it('envia os identificadores do lembrete e da lista ao agendar a notificação', async () => {
    scheduleNotification.mockResolvedValueOnce('native-reminder-id')

    await expect(NotificationService.scheduleReminder(makeReminder())).resolves.toBe('native-reminder-id')

    expect(scheduleNotification).toHaveBeenCalledWith(expect.objectContaining({
      content: expect.objectContaining({
        title: 'Comprar leite',
        data: {
          listId: 'list-1',
          reminderId: 'rem-1',
        },
      }),
      trigger: expect.objectContaining({
        date: new Date('2099-01-01T12:00:00.000Z'),
      }),
    }))
  })
})
