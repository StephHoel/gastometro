import AsyncStorage from '@react-native-async-storage/async-storage'

import { useCartStore } from '@/stores/CartStore'
import { useReminderStore } from '@/stores/ReminderStore'
import { useBillStore } from '@/stores/BillStore'
import { usePriceComparisonStore } from '@/stores/PriceComparisonStore'
import type { BackupPayload } from '@/interfaces/Backup'

const CART_KEY = 'gastometro'
const REMINDERS_KEY = 'gastometro-reminders'
const BILLS_KEY = 'gastometro-bills'
const PRICE_COMPARISON_KEY = 'gastometro-price-comparisons'
const RECOVERY_KEYS = [
  'gastometro-backup-before-restore-cart',
  'gastometro-backup-before-restore-reminders',
  'gastometro-backup-before-restore-bills',
  'gastometro-backup-before-restore-price-comparisons',
] as const
const DATA_KEYS = [CART_KEY, REMINDERS_KEY, BILLS_KEY, PRICE_COMPARISON_KEY] as const
let restoreInProgress = false

function serializeCart(payload: BackupPayload['cart']): string {
  return JSON.stringify({ state: payload, version: 3 })
}
function serializeReminders(payload: BackupPayload['reminders']): string {
  return JSON.stringify({
    state: { reminders: payload.map(({ notificationId: _notificationId, ...reminder }) => reminder) },
    version: 3,
  })
}
function serializeBills(payload: BackupPayload['bills']): string {
  return JSON.stringify({ state: { bills: payload }, version: 1 })
}
function serializePriceComparison(payload: BackupPayload['priceComparison']): string {
  return JSON.stringify({ state: payload, version: 1 })
}

async function rollbackStorage(previous: Map<string, string | null>): Promise<void> {
  for (const key of DATA_KEYS) {
    const value = previous.get(key) ?? null
    if (value === null) await AsyncStorage.removeItem(key)
    else await AsyncStorage.setItem(key, value)
  }
}
function restoreStoreSnapshots(snapshot: {
  cart: ReturnType<typeof useCartStore.getState>
  reminders: ReturnType<typeof useReminderStore.getState>
  bills: ReturnType<typeof useBillStore.getState>
  priceComparison: ReturnType<typeof usePriceComparisonStore.getState>
}): void {
  useCartStore.setState({ lists: snapshot.cart.lists, activeListId: snapshot.cart.activeListId, products: snapshot.cart.products })
  useReminderStore.setState({ reminders: snapshot.reminders.reminders })
  useBillStore.setState({ bills: snapshot.bills.bills })
  usePriceComparisonStore.setState({ places: snapshot.priceComparison.places, entries: snapshot.priceComparison.entries })
}

/** Persiste os quatro stores como uma única operação lógica, com cópias de recuperação e rollback. */
export const BackupRestoreService = {
  async apply(payload: BackupPayload): Promise<void> {
    if (restoreInProgress) throw new Error('Já existe uma restauração em andamento. Aguarde a conclusão antes de tentar novamente.')
    restoreInProgress = true
    try {
      const previousValues = await AsyncStorage.multiGet([...DATA_KEYS])
      const previous = new Map<string, string | null>(previousValues)
      for (const key of DATA_KEYS) if (!previous.has(key)) previous.set(key, null)

      const snapshot = {
        cart: useCartStore.getState(),
        reminders: useReminderStore.getState(),
        bills: useBillStore.getState(),
        priceComparison: usePriceComparisonStore.getState(),
      }

      try {
        const recoveryPairs = RECOVERY_KEYS.map((key, index) => [key, previous.get(DATA_KEYS[index]) ?? ''] as [string, string])
        await AsyncStorage.multiSet([
          ...recoveryPairs,
          [CART_KEY, serializeCart(payload.cart)],
          [REMINDERS_KEY, serializeReminders(payload.reminders)],
          [BILLS_KEY, serializeBills(payload.bills)],
          [PRICE_COMPARISON_KEY, serializePriceComparison(payload.priceComparison)],
        ])

        useCartStore.setState({ lists: payload.cart.lists, activeListId: payload.cart.activeListId, products: payload.cart.products })
        useReminderStore.setState({ reminders: payload.reminders.map(({ notificationId: _notificationId, ...reminder }) => reminder) })
        useBillStore.setState({ bills: payload.bills })
        usePriceComparisonStore.setState({ places: payload.priceComparison.places, entries: payload.priceComparison.entries })
      } catch (error) {
        try {
          await rollbackStorage(previous)
          restoreStoreSnapshots(snapshot)
        } catch (rollbackError) {
          console.error('Falha ao reverter a restauração do backup:', rollbackError)
          throw new Error('A restauração falhou e a recuperação automática não foi concluída. Não limpe os dados do aplicativo; procure suporte.')
        }
        throw error
      }
    } finally {
      restoreInProgress = false
    }
  },
}
