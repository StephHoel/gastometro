import React from 'react'
import { act, render, waitFor } from '@testing-library/react-native'
import { AppState, Platform } from 'react-native'
import Layout from '@/app/(tabs)/_layout'
import { useCartStore } from '@/stores/CartStore'
import { useReminderStore } from '@/stores/ReminderStore'
import { ReminderOrchestrator } from '@/services/ReminderOrchestrator'
import { addNotificationResponseReceivedListener, clearLastNotificationResponse, getLastNotificationResponse, setNotificationChannelAsync, setNotificationHandler } from 'expo-notifications'
import { usePathname, useRouter } from 'expo-router'
import { NotificationService } from '@/services/NotificationService'
import { ServiceWorkerService } from '@/services/ServiceWorkerService'

const mockAppStateRemove = jest.fn()
const mockRouterReplace = jest.fn()
let mockHydrationListener: (() => void) | undefined
let mockHydrated = false
let mockCartState: Record<string, any>
let mockReminderState: Record<string, any>

jest.mock('@/stores/CartStore', () => ({
  useCartStore: Object.assign(
    jest.fn((selector: (state: any) => unknown) => selector(mockCartState)),
    { getState: () => mockCartState },
  ),
}))

jest.mock('@/stores/ReminderStore', () => ({
  useReminderStore: Object.assign(
    jest.fn((selector: (state: any) => unknown) => selector(mockReminderState)),
    {
      getState: () => mockReminderState,
      persist: {
        hasHydrated: () => mockHydrated,
        onFinishHydration: (callback: () => void) => {
          mockHydrationListener = callback
          return jest.fn()
        },
      },
    },
  ),
}))

jest.mock('@/styles/global.css', () => ({}))
jest.mock('nativewind/jsx-runtime', () => require('react/jsx-runtime'))
jest.mock('react-native-css-interop/jsx-runtime', () => require('react/jsx-runtime'))

jest.mock('expo-router', () => {
  const React = require('react')
  const Tabs = ({ children }: { children: React.ReactNode }) => <>{children}</>
  ;(Tabs as any).Screen = () => null
  return {
    Tabs,
    usePathname: jest.fn(() => '/'),
    useRouter: jest.fn(() => ({ replace: mockRouterReplace })),
  }
})

jest.mock('react-native-safe-area-context', () => {
  const React = require('react')
  return { SafeAreaView: ({ children }: { children: React.ReactNode }) => <>{children}</> }
})

jest.mock('react-native', () => {
  return {
    Platform: { OS: 'android' },
    View: 'View',
    Text: 'Text',
    StyleSheet: { create: (styles: Record<string, unknown>) => styles },
    AppState: {
      addEventListener: jest.fn(() => ({ remove: () => mockAppStateRemove() })),
    },
  }
})

jest.mock('@/utils/platform', () => {
  const { Platform } = require('react-native')

  return {
    get isWeb() { return Platform.OS === 'web' },
    get isNative() { return Platform.OS !== 'web' },
    get isAndroid() { return Platform.OS === 'android' },
    get isIOS() { return Platform.OS === 'ios' },
    IsWeb: () => Platform.OS === 'web',
    detectWeb: () => Platform.OS === 'web',
    withWebFallback: (nativeFunction: () => Promise<unknown>, webFunction?: () => Promise<unknown>, fallbackValue?: unknown) =>
      Platform.OS === 'web' ? (webFunction ? webFunction() : Promise.resolve(fallbackValue)) : nativeFunction(),
  }
})


jest.mock('expo-notifications', () => ({
  AndroidImportance: { HIGH: 4 },
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  clearLastNotificationResponse: jest.fn(),
  getLastNotificationResponse: jest.fn(() => null),
  setNotificationChannelAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
}))

jest.mock('@/services/ReminderOrchestrator', () => ({
  ReminderOrchestrator: {
    cleanupOrphans: jest.fn().mockResolvedValue(true),
    syncWithPermissions: jest.fn().mockResolvedValue(undefined),
    syncReminder: jest.fn().mockResolvedValue(undefined),
    removeReminder: jest.fn().mockResolvedValue(undefined),
  },
}))

jest.mock('@/services/NotificationService', () => ({
  NotificationService: {
    clearDeliveredNotifications: jest.fn().mockResolvedValue(undefined),
    getListIdFromNotification: jest.fn(),
    getReminderIdFromNotification: jest.fn(),
  },
}))

jest.mock('@/services/ServiceWorkerService', () => ({
  ServiceWorkerService: { register: jest.fn() },
}))

jest.mock('@/components/Icons', () => ({
  CalculatorIcon: () => null,
  HomeIcon: () => null,
  ListIcon: () => null,
}))

describe('Layout - bootstrap e listeners de lembretes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockHydrationListener = undefined
    mockHydrated = false
    ;(Platform as { OS: string }).OS = 'android'
    ;(usePathname as jest.Mock).mockReturnValue('/')
    ;(useRouter as jest.Mock).mockReturnValue({ replace: mockRouterReplace })
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        sessionStorage: { getItem: jest.fn().mockReturnValue(null), removeItem: jest.fn() },
        location: { origin: 'https://gastometro.test' },
        history: { state: null, replaceState: jest.fn() },
        dispatchEvent: jest.fn(),
      },
    })
    mockCartState = {
      lists: [{ id: 'list-1', name: 'Lista 1', products: [] }],
      activeListId: 'list-1',
      setActiveList: jest.fn(),
    }
    mockReminderState = { reminders: [] }
  })

  it('aguarda a hidratação do store antes de limpar órfãos e sincronizar', async () => {
    await render(<Layout />)

    expect(ReminderOrchestrator.cleanupOrphans).not.toHaveBeenCalled()
    expect(ReminderOrchestrator.syncWithPermissions).not.toHaveBeenCalled()
    expect(mockHydrationListener).toBeDefined()

    await act(async () => {
      mockHydrationListener?.()
    })

    await waitFor(() => {
      expect(ReminderOrchestrator.cleanupOrphans).toHaveBeenCalledWith(['list-1'])
      expect(ReminderOrchestrator.syncWithPermissions).toHaveBeenCalledTimes(1)
    })
  })

  it('executa o bootstrap imediatamente quando o store já está hidratado', async () => {
    mockHydrated = true
    await render(<Layout />)

    await waitFor(() => {
      expect(ReminderOrchestrator.cleanupOrphans).toHaveBeenCalledWith(['list-1'])
      expect(ReminderOrchestrator.syncWithPermissions).toHaveBeenCalledTimes(1)
    })
  })


  it('não sincroniza enquanto a limpeza de órfãos falha e tenta novamente ao retornar ao app', async () => {
    mockHydrated = true
    ;(ReminderOrchestrator.cleanupOrphans as jest.Mock)
      .mockResolvedValueOnce(false)
      .mockResolvedValue(true)

    await render(<Layout />)

    await waitFor(() => {
      expect(ReminderOrchestrator.cleanupOrphans).toHaveBeenCalledTimes(1)
    })
    expect(ReminderOrchestrator.syncWithPermissions).not.toHaveBeenCalled()

    const appStateCallback = (AppState.addEventListener as jest.Mock).mock.calls[0]?.[1]
    await act(async () => {
      appStateCallback?.('active')
    })

    await waitFor(() => {
      expect(ReminderOrchestrator.cleanupOrphans).toHaveBeenCalledTimes(2)
      expect(ReminderOrchestrator.syncWithPermissions).toHaveBeenCalledTimes(1)
    })
  })

  it('registra o listener de resposta uma vez e o remove no desmontar', async () => {
    mockHydrated = true
    const removeListener = jest.fn()
    ;(addNotificationResponseReceivedListener as jest.Mock).mockReturnValue({ remove: removeListener })

    const view = await render(<Layout />)
    expect(addNotificationResponseReceivedListener).toHaveBeenCalledTimes(1)

    mockCartState = {
      ...mockCartState,
      lists: [{ id: 'list-1', name: 'Lista renomeada', products: [{ id: 'p1' }] }],
    }
    await view.rerender(<Layout />)

    expect(addNotificationResponseReceivedListener).toHaveBeenCalledTimes(1)
    await waitFor(() => {
      expect(ReminderOrchestrator.cleanupOrphans).toHaveBeenCalledTimes(1)
      expect(ReminderOrchestrator.syncWithPermissions).toHaveBeenCalledTimes(1)
    })

    await view.unmount()
    expect(removeListener).toHaveBeenCalledTimes(1)
    expect(mockAppStateRemove).toHaveBeenCalledTimes(1)
  })

  it('reconcilia ao retornar ao primeiro plano sem registrar outro listener', async () => {
    mockHydrated = true
    await render(<Layout />)

    await waitFor(() => {
      expect(ReminderOrchestrator.syncWithPermissions).toHaveBeenCalledTimes(1)
    })

    const appStateCallback = (AppState.addEventListener as jest.Mock).mock.calls[0]?.[1]
    await act(async () => {
      appStateCallback?.('active')
    })

    expect(ReminderOrchestrator.syncWithPermissions).toHaveBeenCalledTimes(2)
    expect(addNotificationResponseReceivedListener).toHaveBeenCalledTimes(1)
  })
})


describe('Layout - comportamento por plataforma e abertura de notificações', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockHydrated = true
    mockCartState = {
      lists: [
        { id: 'list-1', name: 'Lista 1', products: [] },
        { id: 'list-2', name: 'Lista 2', products: [] },
      ],
      activeListId: 'list-1',
      setActiveList: jest.fn(),
    }
    mockReminderState = { reminders: [] }
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        sessionStorage: { getItem: jest.fn().mockReturnValue(null), removeItem: jest.fn() },
        location: { origin: 'https://gastometro.test' },
        history: { state: null, replaceState: jest.fn() },
        dispatchEvent: jest.fn(),
      },
    })
    ;(Platform as { OS: string }).OS = 'android'
    ;(usePathname as jest.Mock).mockReturnValue('/')
    ;(useRouter as jest.Mock).mockReturnValue({ replace: mockRouterReplace })
    ;(getLastNotificationResponse as jest.Mock).mockReturnValue(null)
    ;(NotificationService.getListIdFromNotification as jest.Mock).mockReturnValue(null)
    ;(NotificationService.getReminderIdFromNotification as jest.Mock).mockReturnValue(null)
  })

  it('na web registra o service worker e não configura notificações nativas', async () => {
    ;(Platform as { OS: string }).OS = 'web'
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: { title: '' },
    })

    await render(<Layout />)

    expect(ServiceWorkerService.register).toHaveBeenCalledTimes(1)
    expect(setNotificationHandler).not.toHaveBeenCalled()
    expect(setNotificationChannelAsync).not.toHaveBeenCalled()
    expect(addNotificationResponseReceivedListener).not.toHaveBeenCalled()
    expect(AppState.addEventListener).not.toHaveBeenCalled()
    expect(document.title).toBe('Gastômetro')
  })

  it('na web atualiza o título do documento conforme a rota', async () => {
    ;(Platform as { OS: string }).OS = 'web'
    ;(usePathname as jest.Mock).mockReturnValue('/lists')
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: { title: '' },
    })

    await render(<Layout />)

    expect(document.title).toBe('Listas')
  })

  it('na web aplica redirecionamento pendente da sessão uma única vez', async () => {
    ;(Platform as { OS: string }).OS = 'web'
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: { title: '' },
    })
    const getItem = jest.fn().mockReturnValue('/lists?source=redirect#top')
    const removeItem = jest.fn()
    const replaceState = jest.fn()
    const dispatchEvent = jest.fn()
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        sessionStorage: { getItem, removeItem },
        location: { origin: 'https://gastometro.test' },
        history: { state: { previous: true }, replaceState },
        dispatchEvent,
      },
    })
    Object.defineProperty(globalThis, 'PopStateEvent', {
      configurable: true,
      value: class {
        type: string
        constructor(type: string) { this.type = type }
      },
    })

    await render(<Layout />)

    expect(getItem).toHaveBeenCalledWith('redirect')
    expect(removeItem).toHaveBeenCalledWith('redirect')
    expect(replaceState).toHaveBeenCalledWith(
      { previous: true },
      '',
      '/lists?source=redirect#top',
    )
    expect(dispatchEvent).toHaveBeenCalledTimes(1)
  })

  it('configura handler e canal de notificações no Android', async () => {
    await render(<Layout />)

    expect(setNotificationHandler).toHaveBeenCalledWith({
      handleNotification: expect.any(Function),
    })
    expect(setNotificationChannelAsync).toHaveBeenCalledWith('default', expect.objectContaining({
      name: 'Lembretes',
    }))
  })

  it('limpa notificações entregues mesmo quando não existe resposta anterior', async () => {
    await render(<Layout />)

    await waitFor(() => {
      expect(NotificationService.clearDeliveredNotifications).toHaveBeenCalledTimes(1)
    })
    expect(clearLastNotificationResponse).not.toHaveBeenCalled()
    expect(addNotificationResponseReceivedListener).toHaveBeenCalledTimes(1)
  })

  it('ao abrir uma notificação seleciona a lista e navega para a tela principal', async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/lists')
    ;(getLastNotificationResponse as jest.Mock).mockReturnValue({
      actionIdentifier: 'default',
      notification: {
        request: {
          identifier: 'notification-1',
          content: { data: { listId: 'list-2', reminderId: 'rem-2' } },
        },
      },
    })
    ;(NotificationService.getListIdFromNotification as jest.Mock).mockReturnValue('list-2')
    ;(NotificationService.getReminderIdFromNotification as jest.Mock).mockReturnValue('rem-2')

    await render(<Layout />)

    await waitFor(() => {
      expect(mockCartState.setActiveList).toHaveBeenCalledWith('list-2')
      expect(mockRouterReplace).toHaveBeenCalledWith('/')
      expect(clearLastNotificationResponse).toHaveBeenCalledTimes(1)
    })
  })

  it('remove lembrete órfão ao abrir notificação de lista inexistente', async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/lists')
    ;(getLastNotificationResponse as jest.Mock).mockReturnValue({
      actionIdentifier: 'default',
      notification: {
        request: {
          identifier: 'notification-orphan',
          content: { data: { listId: 'removed-list', reminderId: 'orphan-reminder' } },
        },
      },
    })
    ;(NotificationService.getListIdFromNotification as jest.Mock).mockReturnValue('removed-list')
    ;(NotificationService.getReminderIdFromNotification as jest.Mock).mockReturnValue('orphan-reminder')

    await render(<Layout />)

    await waitFor(() => {
      expect(ReminderOrchestrator.removeReminder).toHaveBeenCalledWith('orphan-reminder')
      expect(mockRouterReplace).toHaveBeenCalledWith('/')
    })
    expect(mockCartState.setActiveList).not.toHaveBeenCalled()
  })

  it('ignora resposta repetida recebida pelo listener nativo', async () => {
    ;(NotificationService.getListIdFromNotification as jest.Mock).mockReturnValue('list-2')
    const view = await render(<Layout />)
    const listener = (addNotificationResponseReceivedListener as jest.Mock).mock.calls[0]?.[0]
    const response = {
      actionIdentifier: 'default',
      notification: {
        request: {
          identifier: 'same-notification',
          content: { data: { listId: 'list-2' } },
        },
      },
    }

    await act(async () => {
      listener?.(response)
      listener?.(response)
    })

    expect(mockCartState.setActiveList).toHaveBeenCalledTimes(1)
    await view.unmount()
  })

  it('remove listener nativo ao desmontar o layout', async () => {
    const removeListener = jest.fn()
    ;(addNotificationResponseReceivedListener as jest.Mock).mockReturnValue({ remove: removeListener })

    const view = await render(<Layout />)
    await view.unmount()

    expect(removeListener).toHaveBeenCalledTimes(1)
  })
})


describe('Layout - dependências da sincronização', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockHydrated = true
    mockCartState = {
      lists: [{ id: 'list-1', name: 'Lista 1', products: [] }],
      activeListId: 'list-1',
      setActiveList: jest.fn(),
    }
    mockReminderState = { reminders: [] }
    ;(Platform as { OS: string }).OS = 'android'
    ;(usePathname as jest.Mock).mockReturnValue('/')
    ;(useRouter as jest.Mock).mockReturnValue({ replace: mockRouterReplace })
  })

  it('repete limpeza e sincronização quando os identificadores das listas mudam', async () => {
    const view = await render(<Layout />)
    await waitFor(() => {
      expect(ReminderOrchestrator.syncWithPermissions).toHaveBeenCalledTimes(1)
    })

    mockCartState = {
      ...mockCartState,
      lists: [{ id: 'list-2', name: 'Lista renomeada', products: [] }],
    }
    await view.rerender(<Layout />)

    await waitFor(() => {
      expect(ReminderOrchestrator.cleanupOrphans).toHaveBeenLastCalledWith(['list-2'])
      expect(ReminderOrchestrator.syncWithPermissions).toHaveBeenCalledTimes(2)
    })
  })

  it('sincroniza quando campos do lembrete mudam, mas ignora metadados transitórios', async () => {
    const view = await render(<Layout />)
    await waitFor(() => {
      expect(ReminderOrchestrator.syncWithPermissions).toHaveBeenCalledTimes(1)
    })

    const reminder = {
      id: 'rem-1',
      title: 'Comprar leite',
      datetimeISO: '2099-01-01T10:00:00.000Z',
      enabled: true,
      listId: 'list-1',
      notificationId: 'native-1',
      createdAt: '2098-01-01T10:00:00.000Z',
      updatedAt: '2098-01-01T10:00:00.000Z',
    }
    mockReminderState = { reminders: [reminder] }
    await view.rerender(<Layout />)
    await waitFor(() => {
      expect(ReminderOrchestrator.syncReminder).toHaveBeenCalledWith('rem-1')
    })
    expect(ReminderOrchestrator.syncWithPermissions).toHaveBeenCalledTimes(1)

    mockReminderState = {
      reminders: [{
        ...reminder,
        notificationId: 'native-2',
        updatedAt: '2098-02-01T10:00:00.000Z',
      }],
    }
    await view.rerender(<Layout />)

    expect(ReminderOrchestrator.syncReminder).toHaveBeenCalledTimes(1)
    expect(ReminderOrchestrator.syncWithPermissions).toHaveBeenCalledTimes(1)
  })


  it('sincroniza somente os lembretes alterados e direciona a remoção pelo identificador', async () => {
    const view = await render(<Layout />)
    await waitFor(() => {
      expect(ReminderOrchestrator.syncWithPermissions).toHaveBeenCalledTimes(1)
    })

    const reminder = {
      id: 'rem-1',
      title: 'Comprar leite',
      datetimeISO: '2099-01-01T10:00:00.000Z',
      enabled: true,
      listId: 'list-1',
      notificationId: undefined,
      createdAt: '2098-01-01T10:00:00.000Z',
      updatedAt: '2098-01-01T10:00:00.000Z',
    }
    mockReminderState = { reminders: [reminder] }
    await view.rerender(<Layout />)
    await waitFor(() => {
      expect(ReminderOrchestrator.syncReminder).toHaveBeenCalledWith('rem-1')
    })

    mockReminderState = { reminders: [] }
    await view.rerender(<Layout />)
    await waitFor(() => {
      expect(ReminderOrchestrator.syncReminder).toHaveBeenLastCalledWith('rem-1')
    })

    expect(ReminderOrchestrator.syncWithPermissions).toHaveBeenCalledTimes(1)
  })
  it('não inicia sincronização após desmontar enquanto a limpeza de órfãos está pendente', async () => {
    let finishCleanup: (() => void) | undefined
    ;(ReminderOrchestrator.cleanupOrphans as jest.Mock).mockImplementationOnce(
      () => new Promise<void>((resolve) => { finishCleanup = resolve }),
    )

    const view = await render(<Layout />)
    await waitFor(() => {
      expect(ReminderOrchestrator.cleanupOrphans).toHaveBeenCalledTimes(1)
    })

    await view.unmount()
    await act(async () => {
      finishCleanup?.()
    })

    expect(ReminderOrchestrator.syncWithPermissions).not.toHaveBeenCalled()
  })
})
