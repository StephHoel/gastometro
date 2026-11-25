import { getListIdsSignature, getReminderSyncSignature } from '@/utils/functions/ReminderSyncKey'
import type { ReminderProps } from '@/interfaces/ReminderProps'
import type { ShoppingListProps } from '@/interfaces/ShoppingListProps'

describe('ReminderSyncKey', () => {
  it('ignora alterações em produtos e nomes de listas', () => {
    const firstLists = [
      { id: 'list-1', name: 'Compras', products: [] },
      { id: 'list-2', name: 'Feira', products: [] },
    ] as ShoppingListProps[]
    const changedLists = [
      { id: 'list-1', name: 'Compras da semana', products: [{ id: 'p1' }] },
      { id: 'list-2', name: 'Feira', products: [{ id: 'p2' }] },
    ] as unknown as ShoppingListProps[]

    expect(getListIdsSignature(changedLists)).toBe(getListIdsSignature(firstLists))
  })

  it('inclui somente campos que alteram o agendamento do lembrete', () => {
    const reminder: ReminderProps = {
      id: 'r1',
      title: 'Comprar leite',
      datetimeISO: '2099-01-01T10:00:00.000Z',
      enabled: true,
      listId: 'list-1',
      notificationId: 'native-1',
      createdAt: '2098-01-01T10:00:00.000Z',
      updatedAt: '2098-01-01T10:00:00.000Z',
    }
    const metadataOnly = { ...reminder, notificationId: 'native-2', updatedAt: '2098-02-01T10:00:00.000Z' }

    expect(getReminderSyncSignature([metadataOnly])).toBe(getReminderSyncSignature([reminder]))
    expect(getReminderSyncSignature([{ ...reminder, title: 'Comprar pão' }])).not.toBe(getReminderSyncSignature([reminder]))
    expect(getReminderSyncSignature([{ ...reminder, enabled: false }])).not.toBe(getReminderSyncSignature([reminder]))
  })
})
