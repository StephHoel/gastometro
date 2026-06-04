import { Alert, Linking } from 'react-native'
import { ShareService, GetTotalValueFormated } from '@/services/ShareService'
import type { StateProps } from '@/interfaces/StateProps'

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
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined)
  })

  it('GetTotalValueFormated deve retornar total em BRL', () => {
    const expected = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(28.5)

    expect(GetTotalValueFormated(makeState())).toBe(expected)
  })

  it('shareOnWhatsapp deve abrir URL com mensagem no formato esperado', async () => {
    const canOpenURLSpy = jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true)
    const openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined)

    await ShareService.shareOnWhatsapp(makeState())

    expect(canOpenURLSpy).toHaveBeenCalledTimes(1)
    expect(openURLSpy).toHaveBeenCalledTimes(1)

    const url = canOpenURLSpy.mock.calls[0][0]
    expect(url).toContain('https://api.whatsapp.com/send?text=')

    const encodedMessage = url.split('text=')[1] ?? ''
    const decodedMessage = decodeURIComponent(encodedMessage)

    const currency = (value: number) =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

    expect(decodedMessage).toContain('#Gastômetro')
    expect(decodedMessage).toContain('|| 2x Arroz | ' + currency(10) + ' | ' + currency(20))
    expect(decodedMessage).toContain('|| 1x Feijão | ' + currency(8.5) + ' | ' + currency(8.5))
    expect(decodedMessage).toContain('Valor Total: ' + currency(28.5))
  })

  it('shareOnWhatsapp deve alertar quando WhatsApp não estiver disponível', async () => {
    const canOpenURLSpy = jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(false)
    const openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined)
    const alertSpy = jest.spyOn(Alert, 'alert')

    await ShareService.shareOnWhatsapp(makeState())

    expect(canOpenURLSpy).toHaveBeenCalledTimes(1)
    expect(openURLSpy).not.toHaveBeenCalled()
    expect(alertSpy).toHaveBeenCalledWith(
      'WhatsApp não disponível',
      'Não foi possível abrir o WhatsApp no dispositivo.'
    )
  })
})
