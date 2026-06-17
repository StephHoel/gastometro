import { useReminderStore } from '@/stores/ReminderStore'

describe('useReminderStore', () => {
  beforeEach(() => {
    useReminderStore.setState({ reminders: [] })
  })

  it('deve criar lembrete vinculado a uma lista', () => {
    const reminder = useReminderStore
      .getState()
      .addReminder({ title: 'Revisar feira', datetimeISO: '2099-01-01T10:00:00.000Z', listId: 'list-1' })

    expect(reminder.listId).toBe('list-1')
    expect(useReminderStore.getState().reminders).toHaveLength(1)
  })

  it('deve editar lembrete e atualizar data de modificação', () => {
    const created = useReminderStore
      .getState()
      .addReminder({ title: 'Lembrete', datetimeISO: '2099-01-01T10:00:00.000Z', listId: 'list-1' })

    const updated = useReminderStore.getState().updateReminder(created.id, {
      title: 'Lembrete atualizado',
      datetimeISO: '2099-01-02T10:00:00.000Z',
    })

    expect(updated?.title).toBe('Lembrete atualizado')
    expect(updated?.datetimeISO).toBe('2099-01-02T10:00:00.000Z')
    expect(updated?.id).toBe(created.id)
  })

  it('deve remover lembretes por lista', () => {
    const store = useReminderStore.getState()

    store.addReminder({ title: 'Lista 1', datetimeISO: '2099-01-01T10:00:00.000Z', listId: 'list-1' })
    store.addReminder({ title: 'Lista 2', datetimeISO: '2099-01-01T10:00:00.000Z', listId: 'list-2' })

    store.removeByListId('list-1')

    expect(useReminderStore.getState().reminders).toHaveLength(1)
    expect(useReminderStore.getState().reminders[0].listId).toBe('list-2')
  })
})
