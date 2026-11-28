import AsyncStorage from '@react-native-async-storage/async-storage'

import { BackupRestoreService } from '@/services/BackupRestoreService'

import { useCartStore } from '@/stores/CartStore'
import { useReminderStore } from '@/stores/ReminderStore'
import { useBillStore } from '@/stores/BillStore'
import { usePriceComparisonStore } from '@/stores/PriceComparisonStore'

import { BackupPayload } from '@/interfaces/Backup'

const rawBills = JSON.stringify({ state: { bills: [] }, version: 1 })
const rawPriceComparisons = JSON.stringify({ state: { places: [], entries: [] }, version: 1 })

const originalCart = {
  lists: [{ id: 'local-list', name: 'Lista local', products: [] }],
  activeListId: 'local-list',
  products: [],
}

const payload: BackupPayload = {
  cart: {
    lists: [{
      id: 'backup-list', name: 'Lista do backup', products: [
        { id: 'backup-product', item: 'Arroz', quantity: '1', price: '10', collected: false },
      ]
    }],
    activeListId: 'backup-list',
    products: [{ id: 'backup-product', item: 'Arroz', quantity: '1', price: '10', collected: false }],
  },
  bills: [],
  priceComparison: { places: [], entries: [] },
  reminders: [{
    id: 'backup-reminder',
    title: 'Comprar arroz',
    datetimeISO: '2099-01-01T10:00:00.000Z',
    enabled: true,
    listId: 'backup-list',
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
    notificationId: 'id-nativo-nao-portavel',
  }],
}

describe('BackupRestoreService', () => {
  beforeEach(async () => {
    await AsyncStorage.clear()
    useCartStore.setState(originalCart)
    useReminderStore.setState({ reminders: [] })
    useBillStore.setState({ bills: [] })
    usePriceComparisonStore.setState({ places: [], entries: [] })
  })

  it('preserva os dados brutos e persiste os quatro stores sem IDs nativos', async () => {
    const rawCart = JSON.stringify({ state: originalCart, version: 3 })
    const rawReminders = JSON.stringify({ state: { reminders: [] }, version: 3 })
    await AsyncStorage.multiSet([
      ['gastometro', rawCart],
      ['gastometro-reminders', rawReminders],
    ])

    await BackupRestoreService.apply(payload)

    expect(useCartStore.getState().lists).toEqual(payload.cart.lists)
    expect(useReminderStore.getState().reminders[0]).not.toHaveProperty('notificationId')
    expect(useBillStore.getState().bills).toEqual([])
    expect(usePriceComparisonStore.getState()).toMatchObject({ places: [], entries: [] })
    expect(await AsyncStorage.getItem('gastometro-backup-before-restore-cart')).toBe(rawCart)
    expect(await AsyncStorage.getItem('gastometro-backup-before-restore-reminders')).toBe(rawReminders)
    expect(await AsyncStorage.getItem('gastometro-backup-before-restore-bills')).toBe(rawBills)
    expect(await AsyncStorage.getItem('gastometro-backup-before-restore-price-comparisons')).toBe(rawPriceComparisons)
    expect(JSON.parse((await AsyncStorage.getItem('gastometro')) ?? '{}')).toEqual({
      state: payload.cart,
      version: 3,
    })
    expect(JSON.parse((await AsyncStorage.getItem('gastometro-reminders')) ?? '{}').state.reminders[0])
      .not.toHaveProperty('notificationId')
  })

  it('mantém os dados atuais quando a gravação coordenada falha', async () => {
    const rawCart = JSON.stringify({ state: originalCart, version: 3 })
    const rawReminders = JSON.stringify({ state: { reminders: [] }, version: 3 })
    await AsyncStorage.multiSet([
      ['gastometro', rawCart],
      ['gastometro-reminders', rawReminders],
    ])

    jest.mocked(AsyncStorage.multiSet).mockImplementationOnce(async (pairs) => {
      await AsyncStorage.setItem(pairs[0][0], pairs[0][1])
      await AsyncStorage.setItem(pairs[4][0], pairs[4][1])
      throw new Error('Falha simulada de gravação')
    })

    await expect(BackupRestoreService.apply(payload)).rejects.toThrow('Falha simulada')
    expect(useCartStore.getState().lists).toEqual(originalCart.lists)
    expect(useReminderStore.getState().reminders).toEqual([])
    expect(await AsyncStorage.getItem('gastometro')).toBe(rawCart)
    expect(await AsyncStorage.getItem('gastometro-reminders')).toBe(rawReminders)
    expect(await AsyncStorage.getItem('gastometro-bills')).toBe(rawBills)
    expect(await AsyncStorage.getItem('gastometro-price-comparisons')).toBe(rawPriceComparisons)
  })
  it.each([
    'gastometro',
    'gastometro-reminders',
    'gastometro-bills',
    'gastometro-price-comparisons',
  ])('reverte todos os stores quando a gravação falha em %s', async (failedKey) => {
    const previous = [
      ['gastometro', JSON.stringify({ state: originalCart, version: 3 })],
      ['gastometro-reminders', JSON.stringify({ state: { reminders: [] }, version: 3 })],
      ['gastometro-bills', rawBills],
      ['gastometro-price-comparisons', rawPriceComparisons],
    ] as [string, string][]
    await AsyncStorage.multiSet(previous)

    jest.mocked(AsyncStorage.multiSet).mockImplementationOnce(async (pairs) => {
      for (const [key, value] of pairs) {
        if (key === failedKey) throw new Error('Falha simulada em ' + failedKey)
        await AsyncStorage.setItem(key, value)
      }
    })

    await expect(BackupRestoreService.apply(payload)).rejects.toThrow('Falha simulada')
    for (const [key, value] of previous) {
      expect(await AsyncStorage.getItem(key)).toBe(value)
    }
    expect(useCartStore.getState().lists).toEqual(originalCart.lists)
    expect(useReminderStore.getState().reminders).toEqual([])
    expect(useBillStore.getState().bills).toEqual([])
    expect(usePriceComparisonStore.getState()).toMatchObject({ places: [], entries: [] })
  })

  it('não altera os stores quando falha ao ler os dados anteriores', async () => {
    jest.mocked(AsyncStorage.multiSet).mockClear()
    jest.mocked(AsyncStorage.multiGet).mockRejectedValueOnce(new Error('Falha ao ler estado anterior'))

    await expect(BackupRestoreService.apply(payload)).rejects.toThrow('Falha ao ler estado anterior')

    expect(AsyncStorage.multiSet).not.toHaveBeenCalled()
    expect(useCartStore.getState().lists).toEqual(originalCart.lists)
    expect(useReminderStore.getState().reminders).toEqual([])
  })

  it('restaura corretamente quando ainda não existem dados persistidos', async () => {
    await BackupRestoreService.apply(payload)

    expect(useCartStore.getState().lists).toEqual(payload.cart.lists)
    expect(useReminderStore.getState().reminders[0]).not.toHaveProperty('notificationId')
    expect(JSON.parse((await AsyncStorage.getItem('gastometro')) ?? '{}').state).toEqual(payload.cart)
    expect(JSON.parse((await AsyncStorage.getItem('gastometro-reminders')) ?? '{}').state.reminders[0])
      .not.toHaveProperty('notificationId')
  })

  it('identifica quando o rollback também falha e orienta a preservar os dados', async () => {
    const rawCart = JSON.stringify({ state: originalCart, version: 3 })
    const rawReminders = JSON.stringify({ state: { reminders: [] }, version: 3 })
    await AsyncStorage.multiSet([
      ['gastometro', rawCart],
      ['gastometro-reminders', rawReminders],
    ])
    jest.mocked(AsyncStorage.multiSet).mockRejectedValueOnce(new Error('Falha na gravação'))
    jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('Falha no rollback'))
    const errorLog = jest.spyOn(console, 'error').mockImplementation(() => undefined)

    await expect(BackupRestoreService.apply(payload)).rejects.toThrow('recuperação automática não foi concluída')

    expect(useCartStore.getState().lists).toEqual(originalCart.lists)
    expect(useReminderStore.getState().reminders).toEqual([])
    expect(errorLog).toHaveBeenCalled()
  })

  it('impede duas restaurações simultâneas', async () => {
    const firstRestore = BackupRestoreService.apply(payload)

    await expect(BackupRestoreService.apply(payload)).rejects.toThrow('Já existe uma restauração em andamento')

    await firstRestore
    expect(useCartStore.getState().lists).toEqual(payload.cart.lists)
  })


  it('persiste contas, locais e comparações com as versões dos stores correspondentes', async () => {
    const fullPayload: BackupPayload = {
      ...payload,
      bills: [{ id: 'bill-1', title: 'Internet', amount: '99,90', paid: false }],
      priceComparison: {
        places: [{ id: 'place-1', name: 'Mercado' }],
        entries: [{ id: 'entry-1', itemName: 'Arroz', pricesByPlace: [{ placeId: 'place-1', price: '10,00' }], createdAt: '2026-11-01T10:00:00.000Z', updatedAt: '2026-11-01T10:00:00.000Z' }],
      },
    }
    await BackupRestoreService.apply(fullPayload)
    expect(useBillStore.getState().bills).toEqual(fullPayload.bills)
    expect(usePriceComparisonStore.getState()).toMatchObject(fullPayload.priceComparison)
    expect(JSON.parse((await AsyncStorage.getItem('gastometro-bills')) ?? '{}')).toEqual({ state: { bills: fullPayload.bills }, version: 1 })
    expect(JSON.parse((await AsyncStorage.getItem('gastometro-price-comparisons')) ?? '{}')).toEqual({ state: fullPayload.priceComparison, version: 1 })
  })

})
