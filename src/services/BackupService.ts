import AsyncStorage from '@react-native-async-storage/async-storage'
import type { ProductProps } from '@/interfaces/ProductProps'
import type { ReminderProps } from '@/interfaces/ReminderProps'
import type { ShoppingListProps } from '@/interfaces/ShoppingListProps'
import { normalizeCartPersistedState, normalizeReminderPersistedState } from '@/services/PersistenceMigrationService'

const BACKUP_FORMAT = 'gastometro-backup'
const BACKUP_VERSION = 1

export interface BackupPayload {
  cart: {
    lists: ShoppingListProps[]
    activeListId: string
    products: ProductProps[]
  }
  reminders: ReminderProps[]
}

export interface BackupEnvelope {
  format: typeof BACKUP_FORMAT
  version: number
  exportedAt: string
  appVersion: string
  payload: BackupPayload
}

export interface BackupSummary {
  exportedAt: string
  lists: number
  products: number
  reminders: number
}

export interface BackupConflict {
  id: string
  type: 'lista' | 'produto' | 'lembrete'
  description: string
  localValue: string
  backupValue: string
}

export interface MergeResult {
  payload: BackupPayload
  conflicts: BackupConflict[]
  merged: { lists: number; products: number; reminders: number }
  ignored: { lists: number; products: number; reminders: number }
}

export type ConflictChoices = Record<string, 'local' | 'backup'>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function sameValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

export const BackupService = {
  createEnvelope(payload: BackupPayload, appVersion: string): BackupEnvelope {
    return {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      appVersion,
      payload,
    }
  },

  stringify(envelope: BackupEnvelope): string {
    return JSON.stringify(envelope, null, 2)
  },

  parse(raw: string): { envelope: BackupEnvelope; summary: BackupSummary } {
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      throw new Error('O arquivo não contém um JSON válido. Verifique se o backup está completo.')
    }

    if (!isRecord(parsed) || parsed.format !== BACKUP_FORMAT) {
      throw new Error('Este arquivo não é um backup reconhecido do Gastômetro.')
    }
    if (parsed.version !== BACKUP_VERSION) {
      throw new Error('A versão deste backup não é compatível com esta versão do Gastômetro.')
    }
    if (!isRecord(parsed.payload) || !isRecord(parsed.payload.cart) || !Array.isArray(parsed.payload.reminders)) {
      throw new Error('O backup está incompleto ou possui uma estrutura inválida.')
    }

    const cartResult = normalizeCartPersistedState(parsed.payload.cart, 2)
    const reminderResult = normalizeReminderPersistedState({ reminders: parsed.payload.reminders }, 2)
    const payload: BackupPayload = {
      cart: cartResult.data,
      reminders: reminderResult.data.reminders,
    }

    const listsById = new Map(payload.cart.lists.map((list) => [list.id, list]))
    for (const reminder of payload.reminders) {
      const list = listsById.get(reminder.listId)
      if (!list) {
        throw new Error('O backup contém um lembrete vinculado a uma lista inexistente. Nenhum dado local foi alterado.')
      }
      if (reminder.itemId && !list.products.some((product) => product.id === reminder.itemId)) {
        throw new Error('O backup contém um lembrete vinculado a um produto inexistente. Nenhum dado local foi alterado.')
      }
    }

    if (cartResult.discarded > 0 || reminderResult.discarded > 0) {
      throw new Error('O backup contém registros inválidos. Nenhum dado local foi alterado.')
    }

    const exportedAt = typeof parsed.exportedAt === 'string' && !Number.isNaN(new Date(parsed.exportedAt).getTime())
      ? new Date(parsed.exportedAt).toISOString()
      : ''
    if (!exportedAt) throw new Error('A data de exportação do backup é inválida.')

    const envelope: BackupEnvelope = {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt,
      appVersion: typeof parsed.appVersion === 'string' ? parsed.appVersion : 'desconhecida',
      payload,
    }

    return {
      envelope,
      summary: {
        exportedAt,
        lists: payload.cart.lists.length,
        products: payload.cart.lists.reduce((total, list) => total + list.products.length, 0),
        reminders: payload.reminders.length,
      },
    }
  },

  merge(local: BackupPayload, backup: BackupPayload): MergeResult {
    const lists = local.cart.lists.map((list) => ({ ...list, products: [...list.products] }))
    const reminders = [...local.reminders]
    const conflicts: BackupConflict[] = []
    const merged = { lists: 0, products: 0, reminders: 0 }
    const ignored = { lists: 0, products: 0, reminders: 0 }

    for (const backupList of backup.cart.lists) {
      const localList = lists.find((list) => list.id === backupList.id)
      if (!localList) {
        lists.push({ ...backupList, products: [...backupList.products] })
        merged.lists += 1
        merged.products += backupList.products.length
        continue
      }

      if (localList.name !== backupList.name) {
        conflicts.push({
          id: 'lista:' + backupList.id,
          type: 'lista',
          description: 'A lista "' + localList.name + '" e a lista "' + backupList.name + '" possuem o mesmo identificador.',
          localValue: localList.name,
          backupValue: backupList.name,
        })
      }

      for (const backupProduct of backupList.products) {
        const existingList = lists.find((list) => list.products.some((product) => product.id === backupProduct.id))
        const existing = existingList?.products.find((product) => product.id === backupProduct.id)
        if (!existing) {
          localList.products.push(backupProduct)
          merged.products += 1
        } else if (sameValue(existing, backupProduct) && existingList?.id === backupList.id) {
          ignored.products += 1
        } else {
          conflicts.push({
            id: 'produto:' + backupProduct.id,
            type: 'produto',
            description: 'O produto "' + backupProduct.item + '" já existe com informações diferentes ou está associado a outra lista.',
            localValue: existing.item + ' | ' + existing.quantity + ' | ' + existing.price + ' | lista: ' + (existingList?.name ?? 'desconhecida'),
            backupValue: backupProduct.item + ' | ' + backupProduct.quantity + ' | ' + backupProduct.price + ' | lista: ' + backupList.name,
          })
        }
      }
    }

    for (const backupReminder of backup.reminders) {
      const existing = reminders.find((reminder) => reminder.id === backupReminder.id)
      if (!existing) {
        reminders.push(backupReminder)
        merged.reminders += 1
      } else if (sameValue(existing, backupReminder)) {
        ignored.reminders += 1
      } else {
        conflicts.push({
          id: 'lembrete:' + backupReminder.id,
          type: 'lembrete',
          description: 'O lembrete "' + backupReminder.title + '" já existe com informações diferentes.',
          localValue: existing.title + ' | ' + existing.datetimeISO,
          backupValue: backupReminder.title + ' | ' + backupReminder.datetimeISO,
        })
      }
    }

    return {
      payload: {
        cart: {
          lists,
          activeListId: lists.some((list) => list.id === local.cart.activeListId)
            ? local.cart.activeListId
            : lists[0]?.id ?? '',
          products: lists.find((list) => list.id === local.cart.activeListId)?.products ?? lists[0]?.products ?? [],
        },
        reminders,
      },
      conflicts,
      merged,
      ignored,
    }
  },

  resolveConflicts(local: BackupPayload, backup: BackupPayload, choices: ConflictChoices): BackupPayload {
    const lists = local.cart.lists.map((list) => ({ ...list, products: [...list.products] }))
    const reminders = [...local.reminders]

    for (const backupList of backup.cart.lists) {
      const localList = lists.find((list) => list.id === backupList.id)
      if (!localList) {
        lists.push({ ...backupList, products: [...backupList.products] })
        continue
      }

      if (choices['lista:' + backupList.id] === 'backup') {
        localList.name = backupList.name
      }

      for (const backupProduct of backupList.products) {
        const existing = lists.flatMap((list) => list.products).find((product) => product.id === backupProduct.id)
        if (!existing) {
          localList.products.push(backupProduct)
        } else if (choices['produto:' + backupProduct.id] === 'backup') {
          for (const list of lists) {
            list.products = list.products.filter((product) => product.id !== backupProduct.id)
          }
          localList.products.push(backupProduct)
        }
      }
    }

    for (const backupReminder of backup.reminders) {
      const index = reminders.findIndex((reminder) => reminder.id === backupReminder.id)
      if (index < 0) reminders.push(backupReminder)
      else if (choices['lembrete:' + backupReminder.id] === 'backup') reminders[index] = backupReminder
    }

    const activeListId = lists.some((list) => list.id === local.cart.activeListId)
      ? local.cart.activeListId
      : lists[0]?.id ?? ''

    return {
      cart: {
        lists,
        activeListId,
        products: lists.find((list) => list.id === activeListId)?.products ?? [],
      },
      reminders,
    }
  },

  async preserveCurrentData(): Promise<void> {
    const keys = ['gastometro', 'gastometro-reminders']
    const values = await AsyncStorage.multiGet(keys)
    await AsyncStorage.multiSet([
      ['gastometro-backup-before-restore-cart', values.find(([key]) => key === keys[0])?.[1] ?? ''],
      ['gastometro-backup-before-restore-reminders', values.find(([key]) => key === keys[1])?.[1] ?? ''],
    ])
  },
}
