import type { ReminderProps } from '@/interfaces/ReminderProps'
import type { ReminderStateProps } from '@/interfaces/ReminderStateProps'
import type { StateProps } from '@/interfaces/StateProps'

export function makeReminder(overrides: Partial<ReminderProps> = {}): ReminderProps {
  return {
    id: 'rem-1',
    title: 'Lembrete padrão',
    datetimeISO: '2099-01-01T10:00:00.000Z',
    enabled: false,
    listId: 'list-1',
    notificationId: undefined,
    createdAt: '2099-01-01T09:00:00.000Z',
    updatedAt: '2099-01-01T09:00:00.000Z',
    ...overrides,
  }
}

export function createCartStoreMock(partial: Partial<StateProps> = {}): StateProps {
  return {
    lists: [],
    activeListId: '',
    products: [],
    add: jest.fn(),
    edit: jest.fn(),
    replace: jest.fn(),
    remove: jest.fn(),
    get: jest.fn(),
    clear: jest.fn(),
    addList: jest.fn(),
    removeList: jest.fn(),
    renameList: jest.fn(),
    setActiveList: jest.fn(),
    ...partial,
  }
}

export function createReminderStoreMock(initialReminders: ReminderProps[] = []): ReminderStateProps {
  const state: { reminders: ReminderProps[] } = {
    reminders: [...initialReminders],
  }

  const store: ReminderStateProps = {
    get reminders() {
      return state.reminders
    },
    set reminders(next) {
      state.reminders = next
    },

    addReminder: jest.fn(({ title, datetimeISO, listId, itemId }) => {
      const created = makeReminder({
        id: `rem-${state.reminders.length + 1}`,
        title,
        datetimeISO,
        listId,
        itemId,
      })
      state.reminders = [...state.reminders, created]
      return created
    }),

    updateReminder: jest.fn((reminderId, payload) => {
      const current = state.reminders.find((reminder) => reminder.id === reminderId)
      if (!current) return null

      const updated = {
        ...current,
        ...payload,
      }

      state.reminders = state.reminders.map((reminder) => (reminder.id === reminderId ? updated : reminder))
      return updated
    }),

    setReminderNotification: jest.fn((reminderId, notificationId) => {
      state.reminders = state.reminders.map((reminder) =>
        reminder.id === reminderId ? { ...reminder, notificationId } : reminder,
      )
    }),

    removeReminder: jest.fn((reminderId) => {
      state.reminders = state.reminders.filter((reminder) => reminder.id !== reminderId)
    }),

    removeByListId: jest.fn((listId) => {
      state.reminders = state.reminders.filter((reminder) => reminder.listId !== listId)
    }),

    setEnabled: jest.fn((reminderId, enabled) => {
      state.reminders = state.reminders.map((reminder) =>
        reminder.id === reminderId ? { ...reminder, enabled } : reminder,
      )
    }),

    getByListId: jest.fn((listId) => state.reminders.filter((reminder) => reminder.listId === listId)),
    getById: jest.fn((reminderId) => state.reminders.find((reminder) => reminder.id === reminderId)),
  }

  return store
}
