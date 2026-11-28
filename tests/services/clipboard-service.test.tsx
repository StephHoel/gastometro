type ClipboardModule = {
  getStringAsync: jest.Mock<Promise<string>, []>
  setStringAsync: jest.Mock<Promise<void>, [string]>
}

type ClipboardServiceModule = typeof import('@/services/ClipboardService')

function loadClipboardService(platform: 'web' | 'android') {
  const clipboardModule: ClipboardModule = {
    getStringAsync: jest.fn<Promise<string>, []>(),
    setStringAsync: jest.fn<Promise<void>, [string]>(),
  }

  jest.resetModules()

  jest.doMock('expo-clipboard', () => clipboardModule)
  jest.doMock('react-native', () => ({
    Platform: {
      OS: platform,
    },
  }))

  let clipboardService: ClipboardServiceModule['ClipboardService']

  jest.isolateModules(() => {
    const serviceModule = jest.requireActual('@/services/ClipboardService') as ClipboardServiceModule
    clipboardService = serviceModule.ClipboardService
  })

  return {
    ClipboardService: clipboardService!,
    clipboardModule,
  }
}

describe('ClipboardService', () => {
  const originalNavigator = global.navigator
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined)

  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()

    if (originalNavigator) {
      Object.defineProperty(global, 'navigator', {
        configurable: true,
        value: originalNavigator,
      })
      return
    }

    Reflect.deleteProperty(global, 'navigator')
  })

  afterAll(() => {
    warnSpy.mockRestore()
  })

  it('deve retornar conteúdo do clipboard no nativo', async () => {
    const { ClipboardService, clipboardModule } = loadClipboardService('android')
    clipboardModule.getStringAsync.mockResolvedValue('lista copiada')

    const result = await ClipboardService.getClipboardContent()

    expect(result).toBe('lista copiada')
    expect(clipboardModule.getStringAsync).toHaveBeenCalledTimes(1)
  })

  it('deve escrever conteúdo no clipboard nativo e retornar true', async () => {
    const { ClipboardService, clipboardModule } = loadClipboardService('android')
    clipboardModule.setStringAsync.mockResolvedValue(undefined)

    const result = await ClipboardService.setClipboardContent('lista copiada')

    expect(result).toBe(true)
    expect(clipboardModule.setStringAsync).toHaveBeenCalledWith('lista copiada')
  })

  it('deve retornar false quando a escrita nativa falhar', async () => {
    const { ClipboardService, clipboardModule } = loadClipboardService('android')
    const error = new Error('clipboard indisponível')
    clipboardModule.setStringAsync.mockRejectedValue(error)

    const result = await ClipboardService.setClipboardContent('lista copiada')

    expect(result).toBe(false)
    expect(warnSpy).toHaveBeenCalledWith('Erro ao escrever no clipboard nativo:', error)
  })

  it('deve retornar conteúdo do clipboard na web', async () => {
    const { ClipboardService, clipboardModule } = loadClipboardService('web')
    const readText = jest.fn().mockResolvedValue('lista web')

    Object.defineProperty(global, 'navigator', {
      configurable: true,
      value: {
        clipboard: {
          readText,
        },
      },
    })

    const result = await ClipboardService.getClipboardContent()

    expect(result).toBe('lista web')
    expect(readText).toHaveBeenCalledTimes(1)
    expect(clipboardModule.getStringAsync).not.toHaveBeenCalled()
  })

  it('deve retornar vazio quando a leitura web falhar', async () => {
    const { ClipboardService } = loadClipboardService('web')
    const error = new Error('permissão negada')
    const readText = jest.fn().mockRejectedValue(error)

    Object.defineProperty(global, 'navigator', {
      configurable: true,
      value: {
        clipboard: {
          readText,
        },
      },
    })

    const result = await ClipboardService.getClipboardContent()

    expect(result).toBe('')
    expect(warnSpy).toHaveBeenCalledWith('Erro ao ler clipboard na web:', error)
  })

  it('deve escrever conteúdo no clipboard web e retornar true', async () => {
    const { ClipboardService, clipboardModule } = loadClipboardService('web')
    const writeText = jest.fn().mockResolvedValue(undefined)

    Object.defineProperty(global, 'navigator', {
      configurable: true,
      value: {
        clipboard: {
          writeText,
        },
      },
    })

    const result = await ClipboardService.setClipboardContent('lista web')

    expect(result).toBe(true)
    expect(writeText).toHaveBeenCalledWith('lista web')
    expect(clipboardModule.setStringAsync).not.toHaveBeenCalled()
  })

  it('deve retornar false quando a escrita web falhar', async () => {
    const { ClipboardService } = loadClipboardService('web')
    const error = new Error('sem permissão')
    const writeText = jest.fn().mockRejectedValue(error)

    Object.defineProperty(global, 'navigator', {
      configurable: true,
      value: {
        clipboard: {
          writeText,
        },
      },
    })

    const result = await ClipboardService.setClipboardContent('lista web')

    expect(result).toBe(false)
    expect(warnSpy).toHaveBeenCalledWith('Erro ao escrever no clipboard na web:', error)
  })
})
