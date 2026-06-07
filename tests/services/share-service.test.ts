import { Alert, Linking, Platform } from 'react-native'
import { ShareService, GetTotalValueFormated } from '@/services/ShareService'
import type { StateProps } from '@/interfaces/StateProps'

const originalPlatform = Platform.OS

function makeState(): StateProps {
  return {
    products: [
      { id: '1', item: 'Arroz', quantity: '2', price: '10', collected: false },
      { id: '2', item: 'Feijão', quantity: '1', price: '8.5', collected: false },
    ],
    add: jest.fn(),
    edit: jest.fn(),
    replace: jest.fn(),
    remove: jest.fn(),
    get: jest.fn(),
    clear: jest.fn(),
  }
}

describe('ShareService', () => {
  beforeEach(() => {
    Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true, writable: true })
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined)
  })

  afterAll(() => {
    Object.defineProperty(Platform, 'OS', { value: originalPlatform, configurable: true, writable: true })
  })

  it('GetTotalValueFormated deve retornar total em BRL', () => {
    const expected = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(28.5)

    expect(GetTotalValueFormated(makeState())).toBe(expected)
  })

  it('shareOnWhatsapp deve abrir URL com mensagem no formato esperado', async () => {
    const openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined)

    await ShareService.shareOnWhatsapp(makeState())

    expect(openURLSpy).toHaveBeenCalledTimes(1)

    const url = openURLSpy.mock.calls[0][0]
    expect(url).toContain('whatsapp://send?text=')

    const encodedMessage = url.split('text=')[1] ?? ''
    const decodedMessage = decodeURIComponent(encodedMessage)

    const currency = (value: number) =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

    expect(decodedMessage).toContain('#Gastômetro')
    expect(decodedMessage).toContain('|| 2x Arroz | ' + currency(10) + ' | ' + currency(20))
    expect(decodedMessage).toContain('|| 1x Feijão | ' + currency(8.5) + ' | ' + currency(8.5))
    expect(decodedMessage).toContain('Valor Total: ' + currency(28.5))
  })

  it('shareOnWhatsapp deve abrir fallback web quando deep link falhar', async () => {
    const openURLSpy = jest.spyOn(Linking, 'openURL')
      .mockRejectedValueOnce(new Error('deep link indisponível'))
      .mockResolvedValueOnce(undefined)

    await ShareService.shareOnWhatsapp(makeState())

    expect(openURLSpy).toHaveBeenCalledTimes(2)
    expect(openURLSpy.mock.calls[0][0]).toContain('whatsapp://send?text=')
    expect(openURLSpy.mock.calls[1][0]).toContain('https://wa.me/?text=')
  })

  it('shareOnWhatsapp no web deve abrir somente fallback web', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'web', configurable: true, writable: true })
    const openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined)

    await ShareService.shareOnWhatsapp(makeState())

    expect(openURLSpy).toHaveBeenCalledTimes(1)
    expect(openURLSpy.mock.calls[0][0]).toContain('https://wa.me/?text=')
  })

  it('shareOnWhatsapp deve alertar quando deep link e fallback falharem', async () => {
    const openURLSpy = jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('sem handler'))
    const alertSpy = jest.spyOn(Alert, 'alert')

    await ShareService.shareOnWhatsapp(makeState())

    expect(openURLSpy).toHaveBeenCalledTimes(2)
    expect(alertSpy).toHaveBeenCalledWith(
      'WhatsApp não disponível',
      'Não foi possível abrir o WhatsApp no dispositivo.'
    )
  })
})
