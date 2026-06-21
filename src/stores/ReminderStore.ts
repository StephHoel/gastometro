import type { ReminderProps } from '@/interfaces/ReminderProps'
import type { ReminderStateProps } from '@/interfaces/ReminderStateProps'
import { nowISO } from '@/utils/functions/DateFunctions'
import AsyncStorage from '@react-native-async-storage/async-storage'
import uuid from 'react-native-uuid'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

function updateReminder(
  reminders: ReminderProps[],
  reminderId: string,
  updater: (reminder: ReminderProps) => ReminderProps,
) {
  return reminders.map((reminder) => (reminder.id === reminderId ? updater(reminder) : reminder))
}

export const useReminderStore = create(
  persist<ReminderStateProps>(
    (set, get) => ({
      reminders: [],

      addReminder: ({ title, datetimeISO, listId, itemId }) => {
        const timestamp = nowISO()
        const reminder: ReminderProps = {
          id: uuid.v4().toString(),
          title: title.trim(),
          datetimeISO,
          enabled: true,
          listId,
          itemId,
          createdAt: timestamp,
          updatedAt: timestamp,
        }

        set((state) => ({ reminders: [...state.reminders, reminder] }))
        return reminder
      },

      updateReminder: (reminderId, payload) => {
        const current = get().reminders.find((reminder) => reminder.id === reminderId)
        if (!current) return null

        const next: ReminderProps = {
          ...current,
          ...payload,
          title: payload.title !== undefined ? payload.title.trim() : current.title,
          enabled: true,
          updatedAt: nowISO(),
        }

        set((state) => ({
          reminders: updateReminder(state.reminders, reminderId, () => next),
        }))

        return next
      },

      setReminderNotification: (reminderId, notificationId) =>
        set((state) => ({
          reminders: updateReminder(state.reminders, reminderId, (reminder) => ({
            ...reminder,
            notificationId,
            updatedAt: nowISO(),
          })),
        })),

      removeReminder: (reminderId) =>
        set((state) => ({
          reminders: state.reminders.filter((reminder) => reminder.id !== reminderId),
        })),

      removeByListId: (listId) =>
        set((state) => ({
          reminders: state.reminders.filter((reminder) => reminder.listId !== listId),
        })),

      setEnabled: (reminderId, enabled) =>
        set((state) => ({
          reminders: updateReminder(state.reminders, reminderId, (reminder) => ({
            ...reminder,
            enabled,
            updatedAt: nowISO(),
          })),
        })),

      getByListId: (listId) => get().reminders.filter((reminder) => reminder.listId === listId),
      getById: (reminderId) => get().reminders.find((reminder) => reminder.id === reminderId),
    }),
    {
      name: 'gastometro-reminders',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
)
