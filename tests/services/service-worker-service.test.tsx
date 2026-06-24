type ServiceWorkerRegistrationMock = {
  waiting: { postMessage: jest.Mock<void, [unknown]> } | null
  installing: {
    state: 'installing' | 'installed'
    addEventListener: jest.Mock<void, ['statechange', () => void]>
  } | null
  addEventListener: jest.Mock<void, ['updatefound', () => void]>
  update: jest.Mock<Promise<void>, []>
}

type PlatformMock = { OS: 'web' | 'android' }

function loadServiceWorkerService(options: {
  platform: 'web' | 'android'
  isDev?: boolean
  swDevEnabled?: string
  secureContext?: boolean
  registerReject?: Error
  updateReject?: Error
  withController?: boolean
  withWaiting?: boolean
}) {
  const {
    platform,
    isDev = false,
    swDevEnabled,
    secureContext = true,
    registerReject,
    updateReject,
    withController = false,
    withWaiting = false,
  } = options

  jest.resetModules()

  const platformMock: PlatformMock = { OS: platform }

  const waiting = withWaiting
    ? { postMessage: jest.fn<void, [unknown]>() }
    : null

  const installing = {
    state: 'installing' as const,
    addEventListener: jest.fn<void, ['statechange', () => void]>(),
  }

  const registration: ServiceWorkerRegistrationMock = {
    waiting,
    installing,
    addEventListener: jest.fn<void, ['updatefound', () => void]>(),
    update: jest.fn<Promise<void>, []>(),
  }

  if (updateReject) {
    registration.update.mockRejectedValue(updateReject)
  } else {
    registration.update.mockResolvedValue(undefined)
  }

  const registerMock = jest.fn<Promise<ServiceWorkerRegistrationMock>, [string, { scope: string }]>()

  if (registerReject) {
    registerMock.mockRejectedValue(registerReject)
  } else {
    registerMock.mockResolvedValue(registration)
  }

  const serviceWorkerContainer = {
    register: registerMock,
    controller: withController ? { state: 'activated' } : null,
    addEventListener: jest.fn<void, ['controllerchange', () => void]>(),
  }

  const reloadMock = jest.fn<void, []>()

  Object.defineProperty(global, 'window', {
    configurable: true,
    value: {
      isSecureContext: secureContext,
      location: {
        hostname: 'localhost',
      },
      locationReload: reloadMock,
    },
  })

  Object.defineProperty(global.window, 'location', {
    configurable: true,
    value: {
      hostname: 'localhost',
      reload: reloadMock,
    },
  })

  Object.defineProperty(global, 'navigator', {
    configurable: true,
    value: {
      serviceWorker: serviceWorkerContainer,
    },
  })

  Object.defineProperty(global, '__DEV__', {
    configurable: true,
    value: isDev,
  })

  if (typeof swDevEnabled === 'string') {
    process.env.EXPO_PUBLIC_SW_DEV_ENABLED = swDevEnabled
  } else {
    delete process.env.EXPO_PUBLIC_SW_DEV_ENABLED
  }

  jest.doMock('react-native', () => ({
    Platform: platformMock,
  }))

  let serviceModule: typeof import('@/services/ServiceWorkerService')

  jest.isolateModules(() => {
    serviceModule = jest.requireActual('@/services/ServiceWorkerService') as typeof import('@/services/ServiceWorkerService')
  })

  return {
    ServiceWorkerService: serviceModule!.ServiceWorkerService,
    getServiceWorkerRegistrationConfig: serviceModule!.getServiceWorkerRegistrationConfig,
    registration,
    registerMock,
    serviceWorkerContainer,
    reloadMock,
  }
}

describe('ServiceWorkerService', () => {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)

  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    Reflect.deleteProperty(global, 'navigator')
    Reflect.deleteProperty(global, 'window')
    Reflect.deleteProperty(global, '__DEV__')
    delete process.env.EXPO_PUBLIC_SW_DEV_ENABLED
    delete process.env.EXPO_PUBLIC_ROUTER_BASE
  })

  afterAll(() => {
    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('nao registra service worker fora da web', async () => {
    const { ServiceWorkerService, registerMock } = loadServiceWorkerService({
      platform: 'android',
    })

    const result = await ServiceWorkerService.register()

    expect(result).toBe(false)
    expect(registerMock).not.toHaveBeenCalled()
  })

  it('nao registra service worker em ambiente de desenvolvimento', async () => {
    const { ServiceWorkerService, registerMock } = loadServiceWorkerService({
      platform: 'web',
      isDev: true,
    })

    const result = await ServiceWorkerService.register()

    expect(result).toBe(false)
    expect(registerMock).not.toHaveBeenCalled()
  })

  it('registra service worker em desenvolvimento quando flag de teste estiver ativa', async () => {
    const { ServiceWorkerService, registerMock } = loadServiceWorkerService({
      platform: 'web',
      isDev: true,
      swDevEnabled: '1',
    })

    const result = await ServiceWorkerService.register()

    expect(result).toBe(true)
    expect(registerMock).toHaveBeenCalledTimes(1)
  })

  it('registra service worker com escopo baseado na base do router', async () => {
    process.env.EXPO_PUBLIC_ROUTER_BASE = '/gastometro'

    const { ServiceWorkerService, registerMock } = loadServiceWorkerService({
      platform: 'web',
    })

    const result = await ServiceWorkerService.register()

    expect(result).toBe(true)
    expect(registerMock).toHaveBeenCalledWith('/gastometro/sw.js', { scope: '/gastometro/' })
  })

  it('posta SKIP_WAITING quando ha worker em espera', async () => {
    const { ServiceWorkerService, registration } = loadServiceWorkerService({
      platform: 'web',
      withWaiting: true,
    })

    await ServiceWorkerService.register()

    expect(registration.waiting?.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' })
  })

  it('retorna false quando falha ao registrar service worker', async () => {
    const registerError = new Error('register failed')

    const { ServiceWorkerService } = loadServiceWorkerService({
      platform: 'web',
      registerReject: registerError,
    })

    const result = await ServiceWorkerService.register()

    expect(result).toBe(false)
    expect(errorSpy).toHaveBeenCalled()
  })

  it('retorna true e faz warn quando update falha', async () => {
    const updateError = new Error('update failed')

    const { ServiceWorkerService } = loadServiceWorkerService({
      platform: 'web',
      updateReject: updateError,
    })

    const result = await ServiceWorkerService.register()

    expect(result).toBe(true)
    expect(warnSpy).toHaveBeenCalled()
  })

  it('normaliza configuracao de script/scope para raiz', () => {
    process.env.EXPO_PUBLIC_ROUTER_BASE = '/'

    const { getServiceWorkerRegistrationConfig } = loadServiceWorkerService({
      platform: 'web',
    })

    const config = getServiceWorkerRegistrationConfig()

    expect(config).toEqual({
      scope: '/',
      scriptUrl: '/sw.js',
    })
  })
})
