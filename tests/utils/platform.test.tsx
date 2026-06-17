describe('platform utils', () => {
  const globalWithDom = global as unknown as {
    window: (Window & typeof globalThis) | undefined
    document: Document | undefined
  }

  const originalWindow = global.window
  const originalDocument = global.document

  afterEach(() => {
    jest.resetModules()
    jest.dontMock('react-native')

    if (typeof originalWindow === 'undefined') {
      globalWithDom.window = undefined
    } else {
      globalWithDom.window = originalWindow
    }

    if (typeof originalDocument === 'undefined') {
      globalWithDom.document = undefined
    } else {
      globalWithDom.document = originalDocument
    }
  })

  it('detectWeb retorna false quando window/document não existem', () => {
    globalWithDom.window = undefined
    globalWithDom.document = undefined

    const { detectWeb } = require('@/utils/platform') as typeof import('@/utils/platform')

    expect(detectWeb()).toBe(false)
  })

  it('detectWeb retorna true quando window/document existem', () => {
    globalWithDom.window = {} as Window & typeof globalThis
    globalWithDom.document = {} as Document

    const { detectWeb } = require('@/utils/platform') as typeof import('@/utils/platform')

    expect(detectWeb()).toBe(true)
  })

  it('withWebFallback executa função nativa em plataforma não web', async () => {
    const nativeFunction = jest.fn().mockResolvedValue('native-value')
    const webFunction = jest.fn().mockResolvedValue('web-value')

    const { withWebFallback, isWeb, isNative } = require('@/utils/platform') as typeof import('@/utils/platform')
    const result = await withWebFallback(nativeFunction, webFunction, 'fallback')

    expect(isNative).toBe(!isWeb)
    expect(nativeFunction).toHaveBeenCalledTimes(1)
    expect(webFunction).not.toHaveBeenCalled()
    expect(result).toBe('native-value')
  })

  it('withWebFallback executa função web quando OS é web', async () => {
    jest.doMock('react-native', () => ({
      Platform: { OS: 'web' },
    }))

    const platformModule = require('@/utils/platform') as typeof import('@/utils/platform')
    const nativeFunction = jest.fn().mockResolvedValue('native-value')
    const webFunction = jest.fn().mockResolvedValue('web-value')

    const result = await platformModule.withWebFallback(nativeFunction, webFunction, 'fallback')

    expect(platformModule.isWeb).toBe(true)
    expect(nativeFunction).not.toHaveBeenCalled()
    expect(webFunction).toHaveBeenCalledTimes(1)
    expect(result).toBe('web-value')
  })

  it('withWebFallback retorna fallback quando OS é web e não há função web', async () => {
    jest.doMock('react-native', () => ({
      Platform: { OS: 'web' },
    }))

    const platformModule = require('@/utils/platform') as typeof import('@/utils/platform')
    const nativeFunction = jest.fn().mockResolvedValue('native-value')

    const result = await platformModule.withWebFallback(nativeFunction, undefined, 'fallback-value')

    expect(platformModule.isWeb).toBe(true)
    expect(nativeFunction).not.toHaveBeenCalled()
    expect(result).toBe('fallback-value')
  })
})
