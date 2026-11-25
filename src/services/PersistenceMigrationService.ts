import { CartPersistedData } from '@/interfaces/CartPersistedData'
import type { MigrationResult } from '@/interfaces/MigrationResult'
import { ProductProps } from '@/interfaces/ProductProps'
import type { ReminderProps } from '@/interfaces/ReminderProps'
import { ShoppingListProps } from '@/interfaces/ShoppingListProps'
import { isRecord, isNonEmptyString, isValidDate } from '@/utils/verification_is'

export function normalizeCartPersistedState(
  value: unknown,
  version: number,
): MigrationResult<CartPersistedData> {
  if (version < 0 || version > 2) {
    throw new Error('Versão de dados do carrinho não suportada: ' + version)
  }
  if (!isRecord(value)) throw new Error('Estrutura persistida do carrinho inválida.')

  let repaired = hasUnknownFields(value, ['lists', 'activeListId', 'products'])
  let discarded = 0
  let rawLists: unknown[]

  if (Array.isArray(value.lists) && (value.lists.length > 0 || !Array.isArray(value.products) || value.products.length === 0)) {
    rawLists = value.lists
  } else if (Array.isArray(value.products)) {
    rawLists = [{ id: 'lista-legada-1', name: 'Lista 1', products: value.products }]
    repaired = true
  } else {
    throw new Error('Não foi possível localizar listas ou produtos recuperáveis no carrinho.')
  }

  const usedListIds = new Set<string>()
  const usedProductIds = new Set<string>()
  const lists: ShoppingListProps[] = []

  rawLists.forEach((rawList, listIndex) => {
    if (!isRecord(rawList)) {
      discarded += 1
      repaired = true
      return
    }

    if (hasUnknownFields(rawList, ['id', 'name', 'products'])) repaired = true

    const rawId = isNonEmptyString(rawList.id) ? rawList.id.trim() : 'lista-recuperada-' + (listIndex + 1)
    const id = uniqueId(rawId, usedListIds)
    if (id !== rawId) repaired = true
    if (!isNonEmptyString(rawList.id)) repaired = true

    const name = isNonEmptyString(rawList.name) ? rawList.name.trim() : 'Lista ' + (listIndex + 1)
    if (name !== rawList.name) repaired = true

    const rawProducts = Array.isArray(rawList.products) ? rawList.products : []
    if (!Array.isArray(rawList.products)) repaired = true

    const products: ProductProps[] = []
    rawProducts.forEach((rawProduct) => {
      if (isRecord(rawProduct) && hasUnknownFields(rawProduct, ['id', 'item', 'quantity', 'price', 'collected'])) repaired = true
      const product = parseProduct(rawProduct)
      if (!product) {
        discarded += 1
        repaired = true
        return
      }
      const uniqueProductId = uniqueId(product.id, usedProductIds)
      if (uniqueProductId !== product.id) {
        product.id = uniqueProductId
        repaired = true
      }
      if (isRecord(rawProduct) && (
        rawProduct.id !== product.id ||
        rawProduct.item !== product.item ||
        rawProduct.collected !== product.collected ||
        typeof rawProduct.quantity !== 'string' ||
        typeof rawProduct.price !== 'string'
      )) repaired = true
      products.push(product)
    })

    lists.push({ id, name, products })
  })

  if (lists.length === 0) {
    if (rawLists.length > 0) {
      throw new Error('Nenhuma lista válida pôde ser recuperada do carrinho.')
    }
    lists.push({ id: 'lista-recuperada-1', name: 'Lista 1', products: [] })
    repaired = true
  }

  const activeList = lists.find((list) => list.id === value.activeListId) ?? lists[0]
  if (activeList.id !== value.activeListId) repaired = true

  const products = activeList.products
  if (!Array.isArray(value.products) || JSON.stringify(value.products) !== JSON.stringify(products)) {
    repaired = true
  }

  return {
    data: { lists, activeListId: activeList.id, products },
    repaired,
    discarded,
  }
}

function uniqueId(base: string, used: Set<string>): string {
  if (!used.has(base)) {
    used.add(base)
    return base
  }

  let suffix = 2
  let candidate = base + '-recovered-' + suffix
  while (used.has(candidate)) {
    suffix += 1
    candidate = base + '-recovered-' + suffix
  }
  used.add(candidate)
  return candidate
}

function parseProduct(value: unknown): ProductProps | null {
  if (!isRecord(value) || !isNonEmptyString(value.id) || !isNonEmptyString(value.item)) return null

  const quantity = typeof value.quantity === 'string'
    ? value.quantity
    : typeof value.quantity === 'number' && Number.isFinite(value.quantity)
      ? String(value.quantity)
      : '0'
  const price = typeof value.price === 'string'
    ? value.price
    : typeof value.price === 'number' && Number.isFinite(value.price)
      ? String(value.price)
      : '0'

  return {
    id: value.id.trim(),
    item: value.item.trim(),
    quantity,
    price,
    collected: typeof value.collected === 'boolean' ? value.collected : false,
  }
}

export function normalizeReminderPersistedState(
  value: unknown,
  version: number,
): MigrationResult<{ reminders: ReminderProps[] }> {
  if (version < 0 || version > 2) {
    throw new Error('Versão de dados dos lembretes não suportada: ' + version)
  }
  if (!isRecord(value)) throw new Error('Estrutura persistida dos lembretes inválida.')
  if (value.reminders !== undefined && !Array.isArray(value.reminders)) {
    throw new Error('A coleção persistida de lembretes está malformada.')
  }

  let repaired = value.reminders === undefined || hasUnknownFields(value, ['reminders'])
  let discarded = 0
  const reminders: ReminderProps[] = []
  const usedIds = new Set<string>()
  const rawReminders = Array.isArray(value.reminders) ? value.reminders : []

  rawReminders.forEach((rawReminder) => {
    if (
      !isRecord(rawReminder) ||
      !isNonEmptyString(rawReminder.id) ||
      !isNonEmptyString(rawReminder.title) ||
      !isValidDate(rawReminder.datetimeISO) ||
      !isNonEmptyString(rawReminder.listId)
    ) {
      discarded += 1
      repaired = true
      return
    }

    if (hasUnknownFields(rawReminder, ['id', 'title', 'datetimeISO', 'enabled', 'listId', 'itemId', 'notificationId', 'createdAt', 'updatedAt'])) repaired = true

    const normalizedId = rawReminder.id.trim()
    if (usedIds.has(normalizedId)) {
      discarded += 1
      repaired = true
      return
    }
    usedIds.add(normalizedId)

    const datetimeISO = new Date(rawReminder.datetimeISO).toISOString()
    const createdAt = isValidDate(rawReminder.createdAt) ? new Date(rawReminder.createdAt).toISOString() : datetimeISO
    const updatedAt = isValidDate(rawReminder.updatedAt) ? new Date(rawReminder.updatedAt).toISOString() : createdAt
    const enabled = typeof rawReminder.enabled === 'boolean' ? rawReminder.enabled : true
    const id = normalizedId
    const title = rawReminder.title.trim()
    const listId = rawReminder.listId.trim()
    const itemId = isNonEmptyString(rawReminder.itemId) ? rawReminder.itemId.trim() : undefined
    const notificationId = isNonEmptyString(rawReminder.notificationId) ? rawReminder.notificationId.trim() : undefined

    if (
      datetimeISO !== rawReminder.datetimeISO ||
      createdAt !== rawReminder.createdAt ||
      updatedAt !== rawReminder.updatedAt ||
      enabled !== rawReminder.enabled ||
      id !== rawReminder.id ||
      title !== rawReminder.title ||
      listId !== rawReminder.listId ||
      (rawReminder.itemId !== undefined && (itemId === undefined || itemId !== rawReminder.itemId)) ||
      (rawReminder.notificationId !== undefined && (notificationId === undefined || notificationId !== rawReminder.notificationId))
    ) {
      repaired = true
    }

    reminders.push({
      id,
      title,
      datetimeISO,
      enabled,
      listId,
      ...(itemId ? { itemId } : {}),
      ...(notificationId ? { notificationId } : {}),
      createdAt,
      updatedAt,
    })
  })

  return { data: { reminders }, repaired, discarded }
}

function hasUnknownFields(value: Record<string, unknown>, allowedFields: string[]): boolean {
  const allowed = new Set(allowedFields)
  return Object.keys(value).some((field) => !allowed.has(field))
}
