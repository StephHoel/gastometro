import {
  normalizeCartPersistedState,
  normalizeReminderPersistedState,
} from '@/services/PersistenceMigrationService'

const product = (id: string, item: string) => ({
  id,
  item,
  quantity: '1',
  price: '10,50',
  collected: false,
})

describe('PersistenceMigrationService - carrinho', () => {
  it('migra produtos legados para uma lista sem perder os registros válidos', () => {
    const result = normalizeCartPersistedState({ products: [product('p1', 'Arroz')] }, 0)

    expect(result.data.lists).toHaveLength(1)
    expect(result.data.lists[0]).toMatchObject({ id: 'lista-legada-1', name: 'Lista 1' })
    expect(result.data.products).toEqual([product('p1', 'Arroz')])
    expect(result.data.activeListId).toBe('lista-legada-1')
  })

  it('repara lista ativa, espelho de produtos e IDs duplicados', () => {
    const result = normalizeCartPersistedState({
      lists: [
        { id: 'list-1', name: 'Lista 1', products: [product('p1', 'Arroz')] },
        { id: 'list-1', name: 'Lista 2', products: [product('p1', 'Feijão')] },
      ],
      activeListId: 'missing',
      products: [],
    }, 1)

    expect(result.repaired).toBe(true)
    expect(result.data.lists[1].id).toBe('list-1-recovered-2')
    expect(result.data.lists[1].products[0].id).toBe('p1-recovered-2')
    expect(result.data.activeListId).toBe('list-1')
    expect(result.data.products).toEqual(result.data.lists[0].products)
  })

  it('descarta somente produtos inválidos e mantém os demais', () => {
    const result = normalizeCartPersistedState({
      lists: [{ id: 'list-1', name: 'Lista', products: [null, product('p1', 'Arroz')] }],
      activeListId: 'list-1',
      products: [],
    }, 1)

    expect(result.discarded).toBe(1)
    expect(result.data.products).toEqual([product('p1', 'Arroz')])
  })

  it('descarta campos desconhecidos e sinaliza a normalização para preservar o original', () => {
    const result = normalizeCartPersistedState({
      unexpected: true,
      lists: [{
        id: 'list-1',
        name: 'Lista',
        products: [{ ...product('p1', 'Arroz'), legacyField: 'valor' }],
        legacyListField: true,
      }],
      activeListId: 'list-1',
      products: [],
    }, 2)

    expect(result.repaired).toBe(true)
    expect(result.data).toEqual({
      lists: [{ id: 'list-1', name: 'Lista', products: [product('p1', 'Arroz')] }],
      activeListId: 'list-1',
      products: [product('p1', 'Arroz')],
    })
  })

  it('produz o mesmo resultado ao normalizar novamente um estado já normalizado', () => {
    const first = normalizeCartPersistedState({
      lists: [{ id: 'list-1', name: 'Lista', products: [product('p1', 'Arroz')] }],
      activeListId: 'list-1',
      products: [],
    }, 2)
    const second = normalizeCartPersistedState(first.data, 3)

    expect(second.data).toEqual(first.data)
    expect(second.repaired).toBe(false)
    expect(second.discarded).toBe(0)
  })

  it('preserva a semântica dos campos opcionais ausentes e remove opcionais inválidos', () => {
    const result = normalizeReminderPersistedState({
      reminders: [{
        id: 'r1',
        title: 'Comprar pão',
        datetimeISO: '2099-01-01T10:00:00.000Z',
        listId: 'list-1',
      }],
    }, 2)

    expect(result.data.reminders[0]).toMatchObject({
      id: 'r1',
      enabled: true,
      listId: 'list-1',
      createdAt: '2099-01-01T10:00:00.000Z',
      updatedAt: '2099-01-01T10:00:00.000Z',
    })
    expect(result.data.reminders[0]?.itemId).toBeUndefined()
    expect(result.data.reminders[0]?.notificationId).toBeUndefined()
  })

  it('preserva o erro para estrutura irrecuperável ou versão desconhecida', () => {
    expect(() => normalizeCartPersistedState({ broken: true }, 1)).toThrow()
    expect(() => normalizeCartPersistedState({ products: [] }, 4)).toThrow()
  })
})

describe('PersistenceMigrationService - lembretes', () => {
  it('normaliza lembretes e corrige campos opcionais inválidos', () => {
    const result = normalizeReminderPersistedState({
      reminders: [{
        id: 'r1',
        title: ' Comprar leite ',
        datetimeISO: '2099-01-01T10:00:00.000Z',
        listId: 'list-1',
        enabled: 'yes',
        createdAt: 'inválida',
        updatedAt: 'inválida',
        notificationId: 12,
      }],
    }, 1)

    expect(result.repaired).toBe(true)
    expect(result.data.reminders).toEqual([{
      id: 'r1',
      title: 'Comprar leite',
      datetimeISO: '2099-01-01T10:00:00.000Z',
      enabled: true,
      listId: 'list-1',
      createdAt: '2099-01-01T10:00:00.000Z',
      updatedAt: '2099-01-01T10:00:00.000Z',
    }])
  })

  it('descarta lembretes malformados e IDs duplicados sem apagar os válidos', () => {
    const valid = {
      id: 'r1',
      title: 'Comprar pão',
      datetimeISO: '2099-01-01T10:00:00.000Z',
      enabled: true,
      listId: 'list-1',
      createdAt: '2098-01-01T10:00:00.000Z',
      updatedAt: '2098-01-01T10:00:00.000Z',
    }
    const result = normalizeReminderPersistedState({ reminders: [valid, valid, { id: 'bad' }] }, 1)

    expect(result.discarded).toBe(2)
    expect(result.data.reminders).toHaveLength(1)
    expect(result.data.reminders[0].id).toBe('r1')
  })

  it('descarta campos desconhecidos de lembretes e sinaliza a alteração', () => {
    const result = normalizeReminderPersistedState({
      reminders: [{
        id: 'r1',
        title: 'Comprar pão',
        datetimeISO: '2099-01-01T10:00:00.000Z',
        listId: 'list-1',
        legacyField: 'valor',
      }],
    }, 2)

    expect(result.repaired).toBe(true)
    expect(result.data.reminders[0]).not.toHaveProperty('legacyField')
  })

  it('preserva estrutura malformada e versão futura como erro explícito', () => {
    expect(() => normalizeReminderPersistedState({ reminders: {} }, 1)).toThrow()
    expect(() => normalizeReminderPersistedState({ reminders: [] }, 4)).toThrow()
  })
})
