import { BackupService, type BackupPayload } from '@/services/BackupService'

const product = (id: string, item: string, price = '10') => ({
  id,
  item,
  quantity: '1',
  price,
  collected: false,
})

const list = (id: string, name: string, products = [product('p1', 'Arroz')]) => ({
  id,
  name,
  products,
})

const payload = (lists = [list('l1', 'Lista')], reminders: BackupPayload['reminders'] = []): BackupPayload => ({
  cart: {
    lists,
    activeListId: lists[0]?.id ?? '',
    products: lists[0]?.products ?? [],
  },
  reminders,
})

const reminder = (id: string, title: string, listId = 'l1') => ({
  id,
  title,
  datetimeISO: '2099-01-01T10:00:00.000Z',
  enabled: true,
  listId,
  createdAt: '2026-01-01T10:00:00.000Z',
  updatedAt: '2026-01-01T10:00:00.000Z',
})

describe('BackupService', () => {
  it('gera e valida envelope versionado com resumo dos dados', () => {
    const envelope = BackupService.createEnvelope(payload([list('l1', 'Compras', [
      product('p1', 'Arroz'),
      product('p2', 'Feijão'),
    ])], [reminder('r1', 'Comprar leite')]), '1.10.0')

    const result = BackupService.parse(BackupService.stringify(envelope))

    expect(result.envelope.version).toBe(1)
    expect(result.summary).toMatchObject({ lists: 1, products: 2, reminders: 1 })
  })

  it('rejeita arquivo malformado, formato desconhecido e referências inválidas', () => {
    expect(() => BackupService.parse('{')).toThrow('JSON válido')
    expect(() => BackupService.parse(JSON.stringify({ format: 'outro', version: 1 }))).toThrow('não é um backup reconhecido')

    const invalid = BackupService.createEnvelope(payload([list('l1', 'Lista')], [reminder('r1', 'Lembrete', 'inexistente')]), '1.10.0')
    expect(() => BackupService.parse(BackupService.stringify(invalid))).toThrow('lista inexistente')
  })

  it('mescla registros novos e identifica conflitos sem duplicar registros idênticos', () => {
    const local = payload([list('l1', 'Lista', [product('p1', 'Arroz')])], [reminder('r1', 'Lembrete')])
    const backup = payload([list('l1', 'Lista', [
      product('p1', 'Arroz'),
      product('p2', 'Feijão'),
    ])], [reminder('r1', 'Lembrete'), reminder('r2', 'Outro lembrete')])

    const result = BackupService.merge(local, backup)

    expect(result.conflicts).toHaveLength(0)
    expect(result.merged.products).toBe(1)
    expect(result.merged.reminders).toBe(1)
    expect(result.ignored.products).toBe(1)
    expect(result.ignored.reminders).toBe(1)
    expect(result.payload.cart.lists[0].products).toHaveLength(2)
  })

  it('permite escolher entre dados locais e do backup em cada conflito', () => {
    const local = payload([list('l1', 'Lista local', [product('p1', 'Arroz', '10')])], [reminder('r1', 'Lembrete local')])
    const backup = payload([list('l1', 'Lista backup', [product('p1', 'Arroz', '12')])], [reminder('r1', 'Lembrete backup')])
    const result = BackupService.merge(local, backup)

    expect(result.conflicts.map((conflict) => conflict.id)).toEqual(['lista:l1', 'produto:p1', 'lembrete:r1'])

    const resolved = BackupService.resolveConflicts(local, backup, {
      'lista:l1': 'backup',
      'produto:p1': 'backup',
      'lembrete:r1': 'local',
    })

    expect(resolved.cart.lists[0].name).toBe('Lista backup')
    expect(resolved.cart.products[0].price).toBe('12')
    expect(resolved.reminders[0].title).toBe('Lembrete local')
  })
})
