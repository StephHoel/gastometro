import { useReminderStore } from '@/stores/ReminderStore'

describe('useReminderStore', () => {
  beforeEach(() => {
    useReminderStore.setState({ reminders: [] })
  })

  function createBaseReminder() {
    return useReminderStore
      .getState()
      .addReminder({ title: 'Lembrete', datetimeISO: '2099-01-01T10:00:00.000Z', listId: 'list-1' })
  }

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

  it('retorna null ao tentar atualizar lembrete inexistente', () => {
    const updated = useReminderStore.getState().updateReminder('missing', { title: 'X' })

    expect(updated).toBeNull()
  })

  it('aplica trim no título em create/update e permite buscar/remover por id', () => {
    const created = useReminderStore
      .getState()
      .addReminder({ title: '  Revisar  ', datetimeISO: '2099-01-01T10:00:00.000Z', listId: 'list-1' })

    expect(created.title).toBe('Revisar')
    expect(useReminderStore.getState().getById(created.id)?.id).toBe(created.id)

    const updated = useReminderStore.getState().updateReminder(created.id, { title: '  Atualizado  ' })
    expect(updated?.title).toBe('Atualizado')

    useReminderStore.getState().removeReminder(created.id)
    expect(useReminderStore.getState().getById(created.id)).toBeUndefined()
  })

  it('setEnabled e setReminderNotification atualizam estado do lembrete', () => {
    const created = createBaseReminder()

    useReminderStore.getState().setEnabled(created.id, true)
    useReminderStore.getState().setReminderNotification(created.id, 'notif-1')

    const reminder = useReminderStore.getState().getById(created.id)
    expect(reminder?.enabled).toBe(true)
    expect(reminder?.notificationId).toBe('notif-1')
  })
})
