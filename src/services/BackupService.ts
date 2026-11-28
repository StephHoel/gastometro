import AsyncStorage from '@react-native-async-storage/async-storage'

import {
  normalizeCartPersistedState,
  normalizeReminderPersistedState
} from '@/services/PersistenceMigrationService'

import {
  BackupConflict,
  BackupEnvelope,
  BackupPayload,
  BackupSummary,
  ConflictChoices,
  MergeResult
} from '../interfaces/Backup'

import { isRecord, isNonEmptyString, isValidDate } from '@/utils/verification_is'
import type { BillProps } from '@/interfaces/BillProps'
import type { PriceComparisonEntryProps, PriceComparisonPlaceProps } from '@/interfaces/PriceComparisonProps'
import { parseComparisonPrice, validatePlace } from '@/services/PriceComparisonService'
import { validateBill } from '@/services/BillService'
import { getUtf8ByteLength } from '@/utils/getUtf8ByteLength'
import { sameReminderData } from '@/utils/sameReminderData'
import { sameValue } from '@/utils/sameValue'

import { BACKUP_FORMAT, BACKUP_VERSION, MAX_BACKUP_SIZE } from '@/constants/backup'


function normalizePlaceName(value: string): string {
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
}
function validateReminderReferences(payload: BackupPayload): void {
  const listsById = new Map(payload.cart.lists.map((list) => [list.id, list] as const))
  for (const reminder of payload.reminders) {
    const list = listsById.get(reminder.listId)
    if (!list) {
      throw new Error('O backup contém um lembrete vinculado a uma lista inexistente. Nenhum dado local foi alterado.')
    }
    if (reminder.itemId && !list.products.some((product) => product.id === reminder.itemId)) {
      throw new Error('O backup contém um lembrete vinculado a um produto inexistente ou pertencente a outra lista. Nenhum dado local foi alterado.')
    }
  }
}

function validateResolvedPayload(payload: BackupPayload): BackupPayload {
  const cartResult = normalizeCartPersistedState(payload.cart, 2)
  const reminderResult = normalizeReminderPersistedState({ reminders: payload.reminders }, 2)
  if (cartResult.repaired || reminderResult.repaired || cartResult.discarded > 0 || reminderResult.discarded > 0) {
    throw new Error('As escolhas dos conflitos produziram dados inconsistentes. Revise as opções antes de restaurar.')
  }

  const validated: BackupPayload = {
    cart: cartResult.data,
    reminders: reminderResult.data.reminders,
    bills: validateBills(payload.bills),
    priceComparison: validatePriceComparison(payload.priceComparison),
  }
  validateReminderReferences(validated)
  return validated
}

function validateBills(value: unknown): BillProps[] {
  if (!Array.isArray(value)) throw new Error('A coleção de contas do backup está ausente ou inválida.')
  const ids = new Set<string>()
  return value.map((item) => {
    if (!isRecord(item) || !isNonEmptyString(item.id) || !isNonEmptyString(item.title) ||
      typeof item.amount !== 'string' || !item.amount.trim() || typeof item.paid !== 'boolean' ||
      (item.dueDate !== undefined && typeof item.dueDate !== 'string') ||
      validateBill(item.title, item.amount, typeof item.dueDate === 'string' ? item.dueDate : '') !== null) throw new Error('O backup contém uma conta inválida.')
    const id = item.id.trim()
    if (ids.has(id)) throw new Error('O backup contém identificadores de contas duplicados.')
    ids.add(id)
    return { id, title: item.title, amount: item.amount, ...(item.dueDate !== undefined ? { dueDate: item.dueDate } : {}), paid: item.paid }
  })
}
function validatePriceComparison(value: unknown): { places: PriceComparisonPlaceProps[]; entries: PriceComparisonEntryProps[] } {
  if (!isRecord(value) || !Array.isArray(value.places) || !Array.isArray(value.entries)) throw new Error('A coleção de comparação de preços do backup está ausente ou inválida.')
  const placeIds = new Set<string>()
  const placeNames = new Set<string>()
  const places = value.places.map((item) => {
    if (!isRecord(item) || !isNonEmptyString(item.id) || !isNonEmptyString(item.name) ||
      (item.note !== undefined && typeof item.note !== 'string') || validatePlace(item.name)) throw new Error('O backup contém um local de comparação inválido.')
    const id = item.id.trim()
    const normalizedName = normalizePlaceName(item.name)
    if (placeIds.has(id)) throw new Error('O backup contém identificadores de locais duplicados.')
    if (placeNames.has(normalizedName)) throw new Error('O backup contém nomes de locais duplicados.')
    placeIds.add(id)
    placeNames.add(normalizedName)
    return { id, name: item.name, ...(item.note !== undefined ? { note: item.note } : {}) }
  })
  const entryIds = new Set<string>()
  const entries = value.entries.map((item) => {
    if (!isRecord(item) || !isNonEmptyString(item.id) || !isNonEmptyString(item.itemName) ||
      (item.quantityReference !== undefined && typeof item.quantityReference !== 'string') ||
      !Array.isArray(item.pricesByPlace) || !isValidDate(item.createdAt) || !isValidDate(item.updatedAt)) throw new Error('O backup contém uma comparação de preços inválida.')
    const id = item.id.trim()
    if (entryIds.has(id)) throw new Error('O backup contém identificadores de comparações duplicados.')
    entryIds.add(id)
    const usedPlaceIds = new Set<string>()
    const pricesByPlace = item.pricesByPlace.map((price) => {
      if (!isRecord(price) || !isNonEmptyString(price.placeId) || typeof price.price !== 'string' || !price.price.trim()) throw new Error('O backup contém um preço de comparação inválido.')
      if (!placeIds.has(price.placeId)) throw new Error('O backup contém um preço vinculado a um local inexistente.')
      if (usedPlaceIds.has(price.placeId)) throw new Error('O backup contém preços duplicados para o mesmo local.')
      const parsedPrice = parseComparisonPrice(price.price)
      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) throw new Error('O backup contém um preço inválido.')
      usedPlaceIds.add(price.placeId)
      return { placeId: price.placeId, price: price.price }
    })
    return { id, itemName: item.itemName, ...(item.quantityReference !== undefined ? { quantityReference: item.quantityReference } : {}), pricesByPlace, createdAt: item.createdAt, updatedAt: item.updatedAt }
  })
  return { places, entries }
}

function normalizeComparisonPlaceName(value: string): string {
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
}

function mergePriceComparison(
  local: BackupPayload['priceComparison'],
  backup: BackupPayload['priceComparison'],
  choices: ConflictChoices = {},
  conflicts?: BackupConflict[],
  merged?: MergeResult['merged'],
  ignored?: MergeResult['ignored'],
): BackupPayload['priceComparison'] {
  const places = local.places.map((place) => ({ ...place }))
  const entries = local.entries.map((entry) => ({ ...entry, pricesByPlace: entry.pricesByPlace.map((price) => ({ ...price })) }))
  const placeIdMap = new Map<string, string>()

  for (const backupPlace of backup.places) {
    const normalizedName = normalizeComparisonPlaceName(backupPlace.name)
    const sameName = places.find((place) => place.id !== backupPlace.id && normalizeComparisonPlaceName(place.name) === normalizedName)
    const existing = sameName ?? places.find((place) => place.id === backupPlace.id)
    if (!existing) {
      places.push({ ...backupPlace })
      placeIdMap.set(backupPlace.id, backupPlace.id)
      if (merged) merged.comparisonPlaces += 1
      continue
    }

    placeIdMap.set(backupPlace.id, existing.id)
    if (!sameName && sameValue(existing, backupPlace)) {
      if (ignored) ignored.comparisonPlaces += 1
      continue
    }

    const conflictId = 'local:' + existing.id
    if (choices[conflictId] === 'backup') {
      const index = places.findIndex((place) => place.id === existing.id)
      places[index] = { ...backupPlace, id: existing.id }
    } else if (!choices[conflictId] && conflicts) {
      conflicts.push({
        id: conflictId,
        type: 'local',
        description: 'O local "' + existing.name + '" já existe com o mesmo identificador ou nome normalizado.',
        localValue: existing.name + (existing.note ? ' | ' + existing.note : ''),
        backupValue: backupPlace.name + (backupPlace.note ? ' | ' + backupPlace.note : ''),
      })
    }
  }

  for (const backupEntry of backup.entries) {
    const mappedEntry = {
      ...backupEntry,
      pricesByPlace: backupEntry.pricesByPlace.map((price) => ({
        ...price,
        placeId: placeIdMap.get(price.placeId) ?? price.placeId,
      })),
    }
    const index = entries.findIndex((entry) => entry.id === backupEntry.id)
    if (index < 0) {
      entries.push(mappedEntry)
      if (merged) merged.comparisonEntries += 1
    } else if (sameValue(entries[index], mappedEntry)) {
      if (ignored) ignored.comparisonEntries += 1
    } else {
      const conflictId = 'comparacao:' + backupEntry.id
      if (choices[conflictId] === 'backup') {
        entries[index] = mappedEntry
      } else if (!choices[conflictId] && conflicts) {
        conflicts.push({
          id: conflictId,
          type: 'comparacao',
          description: 'A comparação de "' + backupEntry.itemName + '" já existe com informações diferentes.',
          localValue: entries[index].itemName + ' | ' + entries[index].quantityReference + ' | ' + entries[index].pricesByPlace.map((price) => price.placeId + ': ' + price.price).join(', '),
          backupValue: mappedEntry.itemName + ' | ' + mappedEntry.quantityReference + ' | ' + mappedEntry.pricesByPlace.map((price) => price.placeId + ': ' + price.price).join(', '),
        })
      }
    }
  }

  return { places, entries }
}

export const BackupService = {
  createEnvelope(payload: BackupPayload, appVersion: string): BackupEnvelope {
    return {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      appVersion,
      payload: {
        cart: payload.cart,
        reminders: payload.reminders.map(({ notificationId: _notificationId, ...reminder }) => reminder),
        bills: payload.bills.map((bill) => ({ ...bill })),
        priceComparison: {
          places: payload.priceComparison.places.map((place) => ({ ...place })),
          entries: payload.priceComparison.entries.map((entry) => ({ ...entry, pricesByPlace: entry.pricesByPlace.map((price) => ({ ...price })) })),
        },
      },
    }
  },

  stringify(envelope: BackupEnvelope): string {
    const json = JSON.stringify(envelope, null, 2)
    if (getUtf8ByteLength(json) > MAX_BACKUP_SIZE) {
      throw new Error('O backup gerado excede o limite de 10 MB. Reduza a quantidade de dados e tente novamente.')
    }
    return json
  },

  parse(raw: string): { envelope: BackupEnvelope; summary: BackupSummary; sourceVersion: number } {
    if (getUtf8ByteLength(raw) > MAX_BACKUP_SIZE) {
      throw new Error('O arquivo de backup excede o limite de 10 MB.')
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      throw new Error('O arquivo não contém um JSON válido. Verifique se o backup está completo.')
    }

    if (!isRecord(parsed) || parsed.format !== BACKUP_FORMAT) {
      throw new Error('Este arquivo não é um backup reconhecido do Gastômetro.')
    }
    if (parsed.version !== 1 && parsed.version !== BACKUP_VERSION) {
      throw new Error('A versão deste backup não é compatível com esta versão do Gastômetro.')
    }
    if (!Number.isInteger(parsed.version) || !isRecord(parsed.payload) || !isRecord(parsed.payload.cart) || !Array.isArray(parsed.payload.reminders)) {
      throw new Error('O backup está incompleto ou possui uma estrutura inválida.')
    }

    const rawReminders = parsed.payload.reminders.map((value) => {
      if (!isRecord(value)) return value
      const { notificationId: _notificationId, ...portableReminder } = value
      return portableReminder
    })
    const cartResult = normalizeCartPersistedState(parsed.payload.cart, 2)
    const reminderResult = normalizeReminderPersistedState({ reminders: rawReminders }, 2)
    const isLegacyV1 = parsed.version === 1
    if (!isLegacyV1 && (!Array.isArray(parsed.payload.bills) || !isRecord(parsed.payload.priceComparison))) throw new Error('O backup está incompleto ou possui uma estrutura inválida.')
    const payload: BackupPayload = {
      cart: cartResult.data,
      reminders: reminderResult.data.reminders,
      bills: isLegacyV1 ? [] : validateBills(parsed.payload.bills),
      priceComparison: isLegacyV1 ? { places: [], entries: [] } : validatePriceComparison(parsed.payload.priceComparison),
    }

    validateReminderReferences(payload)

    if (cartResult.repaired || reminderResult.repaired || cartResult.discarded > 0 || reminderResult.discarded > 0) {
      throw new Error('O backup contém registros inválidos ou identificadores duplicados. Nenhum dado local foi alterado.')
    }

    const exportedAt = typeof parsed.exportedAt === 'string' && parsed.exportedAt.trim().length > 0 && !Number.isNaN(new Date(parsed.exportedAt).getTime())
      ? new Date(parsed.exportedAt).toISOString()
      : ''
    if (!exportedAt) throw new Error('A data de exportação do backup é inválida.')

    const envelope: BackupEnvelope = {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt,
      appVersion: typeof parsed.appVersion === 'string' && parsed.appVersion.trim() ? parsed.appVersion.trim() : 'desconhecida',
      payload,
    }

    return {
      envelope,
      sourceVersion: parsed.version as number,
      summary: {
        exportedAt,
        lists: payload.cart.lists.length,
        products: payload.cart.lists.reduce((total, list) => total + list.products.length, 0),
        reminders: payload.reminders.length,
        bills: payload.bills.length,
        comparisonPlaces: payload.priceComparison.places.length,
        comparisonEntries: payload.priceComparison.entries.length,
      },
    }
  },

  merge(local: BackupPayload, backup: BackupPayload): MergeResult {
    const lists = local.cart.lists.map((list) => ({ ...list, products: [...list.products] }))
    const reminders = [...local.reminders]
    const bills = [...local.bills]
    const conflicts: BackupConflict[] = []
    const merged: MergeResult['merged'] = { lists: 0, products: 0, reminders: 0, bills: 0, comparisonPlaces: 0, comparisonEntries: 0 }
    const ignored: MergeResult['ignored'] = { lists: 0, products: 0, reminders: 0, bills: 0, comparisonPlaces: 0, comparisonEntries: 0 }

    for (const backupList of backup.cart.lists) {
      let localList = lists.find((list) => list.id === backupList.id)
      if (!localList) {
        localList = { ...backupList, products: [] }
        lists.push(localList)
        merged.lists += 1
      } else if (localList.name === backupList.name) {
        ignored.lists += 1
      }
      if (localList.name !== backupList.name && local.cart.lists.some((list) => list.id === backupList.id)) {
        conflicts.push({ id: 'lista:' + backupList.id, type: 'lista', description: 'A lista "' + localList.name + '" e a lista "' + backupList.name + '" possuem o mesmo identificador.', localValue: localList.name, backupValue: backupList.name })
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
          conflicts.push({ id: 'produto:' + backupProduct.id, type: 'produto', description: 'O produto "' + backupProduct.item + '" já existe com informações diferentes ou está associado a outra lista.', localValue: existing.item + ' | ' + existing.quantity + ' | ' + existing.price + ' | lista: ' + (existingList?.name ?? 'desconhecida'), backupValue: backupProduct.item + ' | ' + backupProduct.quantity + ' | ' + backupProduct.price + ' | lista: ' + backupList.name })
        }
      }
    }

    for (const backupReminder of backup.reminders) {
      const existing = reminders.find((reminder) => reminder.id === backupReminder.id)
      if (!existing) {
        reminders.push(backupReminder)
        merged.reminders += 1
      } else if (sameReminderData(existing, backupReminder)) {
        ignored.reminders += 1
      } else {
        conflicts.push({ id: 'lembrete:' + backupReminder.id, type: 'lembrete', description: 'O lembrete "' + backupReminder.title + '" já existe com informações diferentes.', localValue: existing.title + ' | ' + existing.datetimeISO + ' | ativo: ' + existing.enabled + ' | lista: ' + existing.listId + ' | item: ' + (existing.itemId ?? 'não vinculado'), backupValue: backupReminder.title + ' | ' + backupReminder.datetimeISO + ' | ativo: ' + backupReminder.enabled + ' | lista: ' + backupReminder.listId + ' | item: ' + (backupReminder.itemId ?? 'não vinculado') })
      }
    }

    for (const backupBill of backup.bills) {
      const index = bills.findIndex((bill) => bill.id === backupBill.id)
      if (index < 0) {
        bills.push(backupBill)
        merged.bills += 1
      } else if (sameValue(bills[index], backupBill)) {
        ignored.bills += 1
      } else {
        conflicts.push({ id: 'conta:' + backupBill.id, type: 'conta', description: 'A conta "' + backupBill.title + '" já existe com informações diferentes.', localValue: bills[index].title + ' | ' + bills[index].amount + ' | paga: ' + bills[index].paid, backupValue: backupBill.title + ' | ' + backupBill.amount + ' | paga: ' + backupBill.paid })
      }
    }

    const priceComparison = mergePriceComparison(local.priceComparison, backup.priceComparison, {}, conflicts, merged, ignored)
    const activeListId = lists.some((list) => list.id === local.cart.activeListId) ? local.cart.activeListId : lists[0]?.id ?? ''
    return {
      payload: {
        cart: { lists, activeListId, products: lists.find((list) => list.id === activeListId)?.products ?? [] },
        reminders, bills, priceComparison,
      },
      conflicts, merged, ignored,
    }
  },

  resolveConflicts(local: BackupPayload, backup: BackupPayload, choices: ConflictChoices): BackupPayload {
    const lists = local.cart.lists.map((list) => ({ ...list, products: [...list.products] }))
    const reminders = [...local.reminders]
    const bills = [...local.bills]

    for (const backupList of backup.cart.lists) {
      let localList = lists.find((list) => list.id === backupList.id)
      if (!localList) {
        localList = { ...backupList, products: [] }
        lists.push(localList)
      }
      if (choices['lista:' + backupList.id] === 'backup') localList.name = backupList.name
      for (const backupProduct of backupList.products) {
        const existing = lists.flatMap((list) => list.products).find((product) => product.id === backupProduct.id)
        if (!existing) localList.products.push(backupProduct)
        else if (choices['produto:' + backupProduct.id] === 'backup') {
          for (const list of lists) list.products = list.products.filter((product) => product.id !== backupProduct.id)
          localList.products.push(backupProduct)
        }
      }
    }
    for (const backupReminder of backup.reminders) {
      const index = reminders.findIndex((reminder) => reminder.id === backupReminder.id)
      if (index < 0) reminders.push(backupReminder)
      else if (choices['lembrete:' + backupReminder.id] === 'backup') reminders[index] = backupReminder
    }
    for (const backupBill of backup.bills) {
      const index = bills.findIndex((bill) => bill.id === backupBill.id)
      if (index < 0) bills.push(backupBill)
      else if (choices['conta:' + backupBill.id] === 'backup') bills[index] = backupBill
    }

    const priceComparison = mergePriceComparison(local.priceComparison, backup.priceComparison, choices)
    const activeListId = lists.some((list) => list.id === local.cart.activeListId) ? local.cart.activeListId : lists[0]?.id ?? ''
    const resolved: BackupPayload = {
      cart: { lists, activeListId, products: lists.find((list) => list.id === activeListId)?.products ?? [] },
      reminders, bills, priceComparison,
    }
    return validateResolvedPayload(resolved)
  },

  async preserveCurrentData(): Promise<void> {
    const keys = ['gastometro', 'gastometro-reminders', 'gastometro-bills', 'gastometro-price-comparisons']
    const values = await AsyncStorage.multiGet(keys)
    await AsyncStorage.multiSet([
      ['gastometro-backup-before-restore-cart', values.find(([key]) => key === keys[0])?.[1] ?? ''],
      ['gastometro-backup-before-restore-reminders', values.find(([key]) => key === keys[1])?.[1] ?? ''],
      ['gastometro-backup-before-restore-bills', values.find(([key]) => key === keys[2])?.[1] ?? ''],
      ['gastometro-backup-before-restore-price-comparisons', values.find(([key]) => key === keys[3])?.[1] ?? ''],
    ])
  },
}
