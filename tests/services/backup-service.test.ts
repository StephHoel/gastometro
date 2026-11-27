import { BackupService } from '@/services/BackupService'
import { MAX_BACKUP_SIZE } from '@/constants/backup'
import { BackupPayload } from '@/interfaces/Backup'

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
  bills: [],
  priceComparison: { places: [], entries: [] },
})

const reminder = (id: string, title: string, listId = 'l1', notificationId?: string) => ({
  id,
  title,
  datetimeISO: '2099-01-01T10:00:00.000Z',
  enabled: true,
  listId,
  ...(notificationId ? { notificationId } : {}),
  createdAt: '2026-01-01T10:00:00.000Z',
  updatedAt: '2026-01-01T10:00:00.000Z',
})

describe('BackupService', () => {
  it('gera e valida envelope versionado com resumo dos dados', () => {
    const envelope = BackupService.createEnvelope(payload([list('l1', 'Compras', [
      product('p1', 'Arroz'),
      product('p2', 'Feijão'),
    ])], [reminder('r1', 'Comprar leite', 'l1', 'native-notification-1')]), '1.10.0')

    expect(envelope.payload.reminders[0]).not.toHaveProperty('notificationId')
    const result = BackupService.parse(BackupService.stringify(envelope))

    expect(result.envelope.version).toBe(2)
    expect(result.summary).toMatchObject({ lists: 1, products: 2, reminders: 1, bills: 0, comparisonPlaces: 0, comparisonEntries: 0 })
  })

  it('rejeita arquivo malformado, formato desconhecido e referências inválidas', () => {
    expect(() => BackupService.parse('{')).toThrow('JSON válido')
    expect(() => BackupService.parse(JSON.stringify({ format: 'outro', version: 1 }))).toThrow('não é um backup reconhecido')

    const invalid = BackupService.createEnvelope(payload([list('l1', 'Lista')], [reminder('r1', 'Lembrete', 'inexistente')]), '1.10.0')
    expect(() => BackupService.parse(BackupService.stringify(invalid))).toThrow('lista inexistente')
  })

  it('rejeita lembrete associado a produto inexistente ou pertencente a outra lista', () => {
    const withItem = (listId: string, itemId: string) => ({
      ...reminder('r-item', 'Lembrete com produto', listId),
      itemId,
    })
    const validLists = [
      list('l1', 'Casa', [product('p1', 'Arroz')]),
      list('l2', 'Mercado', [product('p2', 'Feijão')]),
    ]

    const missingProduct = BackupService.createEnvelope(
      payload(validLists, [withItem('l1', 'inexistente')]),
      '1.11.0',
    )
    expect(() => BackupService.parse(BackupService.stringify(missingProduct)))
      .toThrow('produto inexistente ou pertencente a outra lista')

    const productFromAnotherList = BackupService.createEnvelope(
      payload(validLists, [withItem('l1', 'p2')]),
      '1.11.0',
    )
    expect(() => BackupService.parse(BackupService.stringify(productFromAnotherList)))
      .toThrow('produto inexistente ou pertencente a outra lista')

    const valid = BackupService.createEnvelope(
      payload(validLists, [withItem('l1', 'p1')]),
      '1.11.0',
    )
    expect(BackupService.parse(BackupService.stringify(valid)).envelope.payload.reminders[0].itemId).toBe('p1')
  })

  it('mescla registros novos e identifica conflitos sem duplicar registros idênticos', () => {
    const local = payload([list('l1', 'Lista', [product('p1', 'Arroz')])], [reminder('r1', 'Lembrete', 'l1', 'native-notification-1')])
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

  it('considera o tamanho em bytes UTF-8, inclusive caracteres multibyte', () => {
    const oversized = '😀'.repeat(3 * 1024 * 1024)
    expect(() => BackupService.parse(oversized)).toThrow('excede o limite de 10 MB')
  })

  it('permite gerar backup com exatamente 10 MB e rejeita um byte excedente', () => {
    const baseEnvelope = BackupService.createEnvelope(payload(), '')
    const baseJson = BackupService.stringify(baseEnvelope)
    const exactEnvelope = BackupService.createEnvelope(
      payload(),
      'x'.repeat(MAX_BACKUP_SIZE - baseJson.length),
    )

    const exactJson = BackupService.stringify(exactEnvelope)
    expect(exactJson.length).toBe(MAX_BACKUP_SIZE)

    const oversizedEnvelope = BackupService.createEnvelope(
      payload(),
      'x'.repeat(MAX_BACKUP_SIZE - baseJson.length + 1),
    )
    expect(() => BackupService.stringify(oversizedEnvelope)).toThrow('excede o limite de 10 MB')
  })

  it('remove identificadores de notificações fornecidos por arquivos externos', () => {
    const envelope = BackupService.createEnvelope(
      payload([list('l1', 'Lista')], [reminder('r1', 'Lembrete', 'l1')]),
      '1.11.0',
    )
    const raw = JSON.parse(BackupService.stringify(envelope))
    raw.payload.reminders[0].notificationId = 'identificador-de-outro-dispositivo'

    const parsed = BackupService.parse(JSON.stringify(raw))
    expect(parsed.envelope.payload.reminders[0]).not.toHaveProperty('notificationId')
  })
  it('resolve conflito de produto duplicado entre listas distintas', () => {
    const local = payload([
      list('l1', 'Casa', [product('p1', 'Arroz')]),
      list('l2', 'Mercado', []),
    ])
    const backup = payload([
      list('l1', 'Casa', []),
      list('l2', 'Mercado', [product('p1', 'Arroz', '12')]),
    ])

    const result = BackupService.merge(local, backup)
    expect(result.conflicts.map((conflict) => conflict.id)).toContain('produto:p1')

    const resolved = BackupService.resolveConflicts(local, backup, { 'produto:p1': 'backup' })
    expect(resolved.cart.lists[0].products).toHaveLength(0)
    expect(resolved.cart.lists[1].products).toEqual([product('p1', 'Arroz', '12')])
  })

  it('rejeita payload final com registros duplicados após resolver conflitos', () => {
    const local = payload([
      list('l1', 'Casa', [
        product('p1', 'Arroz'),
        product('p1', 'Feijão'),
      ]),
    ])
    const backup = payload([list('l2', 'Mercado', [])])

    expect(() => BackupService.resolveConflicts(local, backup, {}))
      .toThrow('As escolhas dos conflitos produziram dados inconsistentes')
  })

  it('rejeita resolução de conflito que deixa lembrete apontando para produto movido de lista', () => {
    const local = payload([
      list('l1', 'Casa', [product('p1', 'Arroz')]),
      list('l2', 'Mercado', []),
    ], [ { ...reminder('r1', 'Lembrete local', 'l1'), itemId: 'p1' } ])
    const backup = payload([
      list('l1', 'Casa', []),
      list('l2', 'Mercado', [product('p1', 'Arroz', '12')]),
    ])

    expect(() => BackupService.resolveConflicts(local, backup, { 'produto:p1': 'backup' }))
      .toThrow('produto inexistente ou pertencente a outra lista')
  })

  it('mantém todos os valores locais quando essa opção é escolhida', () => {
    const local = payload(
      [list('l1', 'Lista local', [product('p1', 'Arroz', '10')])],
      [reminder('r1', 'Lembrete local')],
    )
    const backup = payload(
      [list('l1', 'Lista backup', [product('p1', 'Arroz', '12')])],
      [reminder('r1', 'Lembrete backup')],
    )

    const resolved = BackupService.resolveConflicts(local, backup, {
      'lista:l1': 'local',
      'produto:p1': 'local',
      'lembrete:r1': 'local',
    })

    expect(resolved.cart.lists[0].name).toBe('Lista local')
    expect(resolved.cart.products[0].price).toBe('10')
    expect(resolved.reminders[0].title).toBe('Lembrete local')
  })


  it('exporta contas e comparações preservando valores monetários como strings', () => {
    const full = { ...payload(), bills: [{ id: 'b1', title: 'Aluguel', amount: '1.234,56', dueDate: '2026-12-10', paid: false }],
      priceComparison: { places: [{ id: 'place-1', name: 'Mercado Central', note: 'Loja principal' }], entries: [{
        id: 'entry-1', itemName: 'Arroz', quantityReference: '5 kg', pricesByPlace: [{ placeId: 'place-1', price: '12,90' }],
        createdAt: '2026-11-01T10:00:00.000Z', updatedAt: '2026-11-02T10:00:00.000Z',
      }] } }
    const result = BackupService.parse(BackupService.stringify(BackupService.createEnvelope(full, '1.11.0')))
    expect(result.envelope.payload.bills[0].amount).toBe('1.234,56')
    expect(result.envelope.payload.priceComparison.entries[0].pricesByPlace[0].price).toBe('12,90')
    expect(result.summary).toMatchObject({ bills: 1, comparisonPlaces: 1, comparisonEntries: 1 })
  })
  it('migra backup v1 mantendo dados existentes e criando coleções novas vazias', () => {
    const raw = JSON.parse(BackupService.stringify(BackupService.createEnvelope(payload([list('old-list', 'Lista antiga')], [reminder('old-reminder', 'Lembrete', 'old-list')]), '1.10.0')))
    raw.version = 1
    delete raw.payload.bills
    delete raw.payload.priceComparison
    const migrated = BackupService.parse(JSON.stringify(raw))
    expect(migrated.envelope.version).toBe(2)
    expect(migrated.sourceVersion).toBe(1)
    expect(migrated.envelope.payload.cart.lists[0].id).toBe('old-list')
    expect(migrated.envelope.payload.reminders[0].id).toBe('old-reminder')
    expect(migrated.envelope.payload.bills).toEqual([])
    expect(migrated.envelope.payload.priceComparison).toEqual({ places: [], entries: [] })
  })
  it('informa a versão original quando o backup já está no schema atual', () => {
    const envelope = BackupService.createEnvelope(payload(), '1.11.0')
    const parsed = BackupService.parse(BackupService.stringify(envelope))

    expect(parsed.sourceVersion).toBe(2)
    expect(parsed.envelope.version).toBe(2)
  })

  it('rejeita contas com IDs duplicados ou campos inválidos', () => {
    const raw = JSON.parse(BackupService.stringify(BackupService.createEnvelope(payload(), '1.11.0')))
    raw.payload.bills = [{ id: 'b1', title: 'Conta', amount: '10,00', paid: false }, { id: 'b1', title: 'Outra', amount: '20,00', paid: true }]
    expect(() => BackupService.parse(JSON.stringify(raw))).toThrow('identificadores de contas duplicados')
    raw.payload.bills = [{ id: 'b2', title: 'Conta', amount: 10, paid: false }]
    expect(() => BackupService.parse(JSON.stringify(raw))).toThrow('conta inválida')
  })
  it('valida locais, referências, preços e datas das comparações', () => {
    const raw = JSON.parse(BackupService.stringify(BackupService.createEnvelope(payload(), '1.11.0')))
    raw.payload.priceComparison = { places: [{ id: 'p1', name: 'Mercado' }, { id: 'p2', name: 'MERCADO' }], entries: [] }
    expect(() => BackupService.parse(JSON.stringify(raw))).toThrow('nomes de locais duplicados')
    raw.payload.priceComparison.places = [{ id: 'p1', name: 'Mercado' }]
    raw.payload.priceComparison.entries = [{ id: 'e1', itemName: 'Arroz', pricesByPlace: [{ placeId: 'ausente', price: '10,00' }], createdAt: '2026-11-01T10:00:00.000Z', updatedAt: '2026-11-01T10:00:00.000Z' }]
    expect(() => BackupService.parse(JSON.stringify(raw))).toThrow('local inexistente')
    raw.payload.priceComparison.entries[0].pricesByPlace = [{ placeId: 'p1', price: 'preço inválido' }]
    expect(() => BackupService.parse(JSON.stringify(raw))).toThrow('preço inválido')
    raw.payload.priceComparison.entries[0].pricesByPlace = []
    raw.payload.priceComparison.entries[0].createdAt = 'data inválida'
    expect(() => BackupService.parse(JSON.stringify(raw))).toThrow('comparação de preços inválida')
  })
  it('exige as novas coleções no schema v2 e rejeita versões futuras', () => {
    const raw = JSON.parse(BackupService.stringify(BackupService.createEnvelope(payload(), '1.11.0')))
    delete raw.payload.bills
    expect(() => BackupService.parse(JSON.stringify(raw))).toThrow('estrutura inválida')
    raw.version = 3
    expect(() => BackupService.parse(JSON.stringify(raw))).toThrow('versão deste backup não é compatível')
  })


  it('mescla contas e comparações novas e ignora registros idênticos', () => {
    const local: BackupPayload = { ...payload(), bills: [{ id: 'b1', title: 'Água', amount: '50,00', paid: false }],
      priceComparison: { places: [{ id: 'p1', name: 'Mercado' }], entries: [] } }
    const backup: BackupPayload = { ...payload(), bills: [{ id: 'b1', title: 'Água', amount: '50,00', paid: false }, { id: 'b2', title: 'Luz', amount: '80,00', paid: false }],
      priceComparison: { places: [{ id: 'p1', name: 'Mercado' }, { id: 'p2', name: 'Padaria' }], entries: [{
        id: 'e1', itemName: 'Pão', pricesByPlace: [{ placeId: 'p2', price: '8,50' }],
        createdAt: '2026-11-01T10:00:00.000Z', updatedAt: '2026-11-01T10:00:00.000Z',
      }] } }
    const result = BackupService.merge(local, backup)
    expect(result.payload.bills.map((bill) => bill.id)).toEqual(['b1', 'b2'])
    expect(result.payload.priceComparison.places.map((place) => place.id)).toEqual(['p1', 'p2'])
    expect(result.payload.priceComparison.entries[0].pricesByPlace[0].placeId).toBe('p2')
    expect(result.merged).toMatchObject({ bills: 1, comparisonPlaces: 1, comparisonEntries: 1 })
    expect(result.ignored).toMatchObject({ bills: 1, comparisonPlaces: 1 })
  })

  it('detecta conflitos de conta, local por nome normalizado e comparação', () => {
    const local: BackupPayload = { ...payload(), bills: [{ id: 'b1', title: 'Conta local', amount: '10,00', paid: false }],
      priceComparison: { places: [{ id: 'p-local', name: 'Mercado Central', note: 'Local' }], entries: [{
        id: 'e1', itemName: 'Arroz', pricesByPlace: [{ placeId: 'p-local', price: '10,00' }],
        createdAt: '2026-11-01T10:00:00.000Z', updatedAt: '2026-11-01T10:00:00.000Z',
      }] } }
    const backup: BackupPayload = { ...payload(), bills: [{ id: 'b1', title: 'Conta backup', amount: '12,00', paid: true }],
      priceComparison: { places: [{ id: 'p-backup', name: 'MERCADO CENTRAL', note: 'Backup' }], entries: [{
        id: 'e1', itemName: 'Arroz integral', pricesByPlace: [{ placeId: 'p-backup', price: '9,00' }],
        createdAt: '2026-11-02T10:00:00.000Z', updatedAt: '2026-11-02T10:00:00.000Z',
      }] } }
    const result = BackupService.merge(local, backup)
    expect(result.conflicts.map((item) => item.id)).toEqual(['conta:b1', 'local:p-local', 'comparacao:e1'])
    const resolved = BackupService.resolveConflicts(local, backup, {
      'conta:b1': 'backup', 'local:p-local': 'backup', 'comparacao:e1': 'backup',
    })
    expect(resolved.bills[0].title).toBe('Conta backup')
    expect(resolved.priceComparison.places).toEqual([{ id: 'p-local', name: 'MERCADO CENTRAL', note: 'Backup' }])
    expect(resolved.priceComparison.entries[0].pricesByPlace).toEqual([{ placeId: 'p-local', price: '9,00' }])
  })


  it('aplica as mesmas regras de valor e vencimento usadas no cadastro de contas', () => {
    const raw = JSON.parse(BackupService.stringify(BackupService.createEnvelope(payload(), '1.11.0')))
    raw.payload.bills = [{ id: 'bill-1', title: 'Conta', amount: '10,00', dueDate: '', paid: false }]
    expect(BackupService.parse(JSON.stringify(raw)).envelope.payload.bills[0].dueDate).toBe('')
    raw.payload.bills[0].dueDate = '2026-02-31'
    expect(() => BackupService.parse(JSON.stringify(raw))).toThrow('conta inválida')
    raw.payload.bills[0].dueDate = ''
    raw.payload.bills[0].amount = '0'
    expect(() => BackupService.parse(JSON.stringify(raw))).toThrow('conta inválida')
  })

})
