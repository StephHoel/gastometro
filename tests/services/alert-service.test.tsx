import { alert } from '@/constants/alert'
import { ERROR } from '@/constants/text/error'
import type { CustomAlertRef } from '@/interfaces/CustomAlertRef'
import type { ProductProps } from '@/interfaces/ProductProps'
import type { StateProps } from '@/interfaces/StateProps'
import { AlertService } from '@/services/AlertService'
import { ClipboardService } from '@/services/ClipboardService'
import { ShareService } from '@/services/ShareService'
import * as ConvertToProductsListModule from '@/utils/functions/ConvertToProductsList'

function makeStore(): StateProps {
  return {
    lists: [{ id: 'list-1', name: 'Test', products: [] }],
    activeListId: 'list-1',
    products: [],
    add: jest.fn(),
    edit: jest.fn(),
    replace: jest.fn(),
    remove: jest.fn(),
    get: jest.fn(),
    clear: jest.fn(),
    addList: jest.fn(),
    removeList: jest.fn(),
    renameList: jest.fn(),
    setActiveList: jest.fn(),
  }
}

describe('AlertService', () => {
  const showAlert = jest.fn()
  const ref = {
    showAlert,
    hideAlert: jest.fn(),
  } as CustomAlertRef

  beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
    AlertService.init(ref)
  })

  it('alert deve exibir título e mensagem', () => {
    AlertService.alert('Título', 'Mensagem')

    expect(showAlert).toHaveBeenCalledWith({ title: 'Título', message: 'Mensagem' })
  })

  it('ok deve montar alerta com botão OK', () => {
    AlertService.ok('Erro!', 'Falhou')

    const payload = showAlert.mock.calls[0][0] as {
      title: string
      message: string
      buttons: Array<{ text: string; action: () => void }>
    }

    expect(payload.title).toBe('Erro!')
    expect(payload.message).toBe('Falhou')
    expect(payload.buttons).toHaveLength(1)
    expect(payload.buttons[0].text).toBe(alert.share.buttons.ok)
  })

  it('remove deve montar confirmação para item e para remover tudo', () => {
    const action = jest.fn()
    const prod: ProductProps = {
      id: '1',
      item: 'Arroz',
      quantity: '1',
      price: '10',
      collected: false,
    }

    AlertService.remove(action, prod)
    AlertService.remove(action)

    const first = showAlert.mock.calls[0][0] as {
      title: string
      message: string
      buttons: Array<{ text: string; action: () => void }>
    }
    const second = showAlert.mock.calls[1][0] as {
      title: string
      message: string
      buttons: Array<{ text: string; action: () => void }>
    }

    expect(first.title).toBe(alert.remove.title)
    expect(first.message).toBe(alert.remove.message('Arroz'))
    expect(first.buttons[0].text).toBe(alert.remove.button.title)

    expect(second.title).toBe(alert.removeAll.title)
    expect(second.message).toBe(alert.removeAll.message)
    expect(second.buttons[0].text).toBe(alert.removeAll.button.title)
  })

  it('shareEmpty deve exibir mensagem esperada', () => {
    AlertService.shareEmpty()

    expect(showAlert).toHaveBeenCalledWith({
      title: alert.share.title,
      message: alert.share.message,
      buttons: [{ text: alert.share.buttons.ok, action: expect.any(Function) }],
    })
  })

  it('share deve expor botões de WhatsApp e colar lista', async () => {
    const store = makeStore()
    const shareSpy = jest.spyOn(ShareService, 'shareOnWhatsapp').mockResolvedValue(undefined)
    const pasteSpy = jest.spyOn(AlertService, 'paste').mockResolvedValue(undefined)

    AlertService.share(store)

    const payload = showAlert.mock.calls[0][0] as {
      title: string
      buttons: Array<{ text: string; action: () => Promise<void> | void }>
    }
    expect(payload.title).toBe(alert.share.title)
    expect(payload.buttons.map((button) => button.text)).toEqual([
      alert.share.buttons.whatsapp,
      alert.share.buttons.paste,
    ])

    await payload.buttons[0].action()
    await payload.buttons[1].action()

    expect(shareSpy).toHaveBeenCalledWith(store)
    expect(pasteSpy).toHaveBeenCalledWith(store)
  })

  it('paste deve oferecer colar em lista ativa ou nova quando conteúdo é válido', async () => {
    const clipboardSpy = jest.spyOn(ClipboardService, 'getClipboardContent')
    const convertSpy = jest.spyOn(ConvertToProductsListModule, 'ConvertToProductsList')
    const store = makeStore()

    clipboardSpy.mockResolvedValue('#Gastômetro\n--\n|| 1x Arroz | R$ 10,00 | R$ 10,00\n--')
    const parsed = [
      { id: '1', item: 'Arroz', quantity: '1', price: '10.00', collected: false },
      { id: '2', item: 'Feijão', quantity: '2', price: '8.00', collected: false },
    ]
    convertSpy.mockReturnValue(parsed)

    await AlertService.paste(store)

    expect(convertSpy).toHaveBeenCalledTimes(1)

    const payload = showAlert.mock.calls[0][0] as {
      title: string
      buttons: Array<{ text: string; action: () => void }>
    }
    expect(payload.title).toBe(alert.paste.title)
    expect(payload.buttons[0].text).toBe(alert.paste.buttons.oldList)
    expect(payload.buttons[1].text).toBe(alert.paste.buttons.newList)

    payload.buttons[0].action()
    expect(store.replace).toHaveBeenCalledWith(parsed)

    payload.buttons[1].action()
    expect(store.replace).toHaveBeenCalledWith(parsed)
  })

  it('paste deve unir duplicados automaticamente na lista ativa', async () => {
    const clipboardSpy = jest.spyOn(ClipboardService, 'getClipboardContent')
    const convertSpy = jest.spyOn(ConvertToProductsListModule, 'ConvertToProductsList')

    const store = makeStore()
    store.products = [
      { id: 'a', item: 'Arroz', quantity: '1', price: '10', collected: true },
    ]

    clipboardSpy.mockResolvedValue('#Gastômetro\n--\n|| 2x arroz | R$ 10,00 | R$ 20,00\n--')
    convertSpy.mockReturnValue([
      { id: 'b', item: ' arroz ', quantity: '2', price: '10.00', collected: false },
    ])

    await AlertService.paste(store)

    const payload = showAlert.mock.calls[0][0] as {
      title: string
      buttons: Array<{ text: string; action: () => void }>
    }

    payload.buttons[0].action()

    expect(store.replace).toHaveBeenCalledWith([
      { id: 'a', item: 'Arroz', quantity: '3', price: '10', collected: false },
    ])
    expect(showAlert).toHaveBeenCalledTimes(1)
    expect(store.add).not.toHaveBeenCalled()
  })

  it('paste deve unir apenas duplicados por nome+preço e manter os demais', async () => {
    jest.spyOn(ClipboardService, 'getClipboardContent').mockResolvedValue('#Gastômetro\n--\n|| 2x arroz | R$ 10,00 | R$ 20,00\n--')
    jest.spyOn(ConvertToProductsListModule, 'ConvertToProductsList').mockReturnValue([
      { id: 'b', item: ' arroz ', quantity: '2', price: '10.00', collected: false },
      { id: 'c', item: 'Arroz', quantity: '1', price: '12', collected: false },
    ])

    const store = makeStore()
    store.products = [
      { id: 'a', item: 'Arroz', quantity: '1', price: '10', collected: true },
    ]

    await AlertService.paste(store)

    const payload = showAlert.mock.calls[0][0] as {
      buttons: Array<{ text: string; action: () => void }>
    }
    payload.buttons[0].action()

    expect(store.replace).toHaveBeenCalledWith([
      { id: 'a', item: 'Arroz', quantity: '3', price: '10', collected: false },
      { id: 'c', item: 'Arroz', quantity: '1', price: '12', collected: false },
    ])
    expect(showAlert).toHaveBeenCalledTimes(1)
  })

  it('paste deve mostrar erro quando lista convertida estiver vazia', async () => {
    const clipboardSpy = jest.spyOn(ClipboardService, 'getClipboardContent').mockResolvedValue('#Gastômetro\n--\n--')
    const convertSpy = jest.spyOn(ConvertToProductsListModule, 'ConvertToProductsList').mockReturnValue([])
    const okSpy = jest.spyOn(AlertService, 'ok').mockImplementation(() => undefined)

    await AlertService.paste(makeStore())

    expect(clipboardSpy).toHaveBeenCalledTimes(1)
    expect(convertSpy).toHaveBeenCalledTimes(1)
    expect(okSpy).toHaveBeenCalledWith(ERROR.alert_title, ERROR.invalid_list_format)
  })

  it('paste deve mostrar erro quando conteúdo não estiver no padrão', async () => {
    jest.spyOn(ClipboardService, 'getClipboardContent').mockResolvedValue('texto fora do padrão')
    const okSpy = jest.spyOn(AlertService, 'ok').mockImplementation(() => undefined)

    await AlertService.paste(makeStore())

    expect(okSpy).toHaveBeenCalledWith(ERROR.alert_title, ERROR.invalid_list_format)
  })

  it('paste deve tratar erro de clipboard e mostrar alerta', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    jest.spyOn(ClipboardService, 'getClipboardContent').mockRejectedValue(new Error('clipboard indisponível'))
    const okSpy = jest.spyOn(AlertService, 'ok').mockImplementation(() => undefined)

    await AlertService.paste(makeStore())

    expect(consoleSpy).toHaveBeenCalledTimes(1)
    expect(okSpy).toHaveBeenCalledWith(ERROR.alert_title, ERROR.invalid_list_format)
  })
})
