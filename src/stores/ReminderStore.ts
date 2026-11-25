import type { ReminderProps } from '@/interfaces/ReminderProps'
import type { ReminderStateProps } from '@/interfaces/ReminderStateProps'
import { nowISO } from '@/utils/functions/DateFunctions'
import AsyncStorage from '@react-native-async-storage/async-storage'
import uuid from 'react-native-uuid'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { normalizeReminderPersistedState } from '@/services/PersistenceMigrationService'
import { PersistenceRecoveryService } from '@/services/PersistenceRecoveryService'
import { createRecoveryAwareStorage } from '@/services/PersistenceStorage'

function updateReminder(
  reminders: ReminderProps[],
  reminderId: string,
  updater: (reminder: ReminderProps) => ReminderProps,
) {
  return reminders.map((reminder) => (reminder.id === reminderId ? updater(reminder) : reminder))
}

const REMINDER_RECOVERY_KEY = 'gastometro-recovery-reminders'
const reminderPersistence = createRecoveryAwareStorage()

async function preserveReminderData(value: unknown): Promise<boolean> {
  try {
    await AsyncStorage.setItem(REMINDER_RECOVERY_KEY, JSON.stringify(value))
    return true
  } catch (error) {
    PersistenceRecoveryService.report('Não foi possível criar uma cópia de recuperação dos dados dos lembretes. Evite limpar os dados do aplicativo e procure suporte.')
    console.error('Falha ao preservar dados do lembretes:', error)
    return false
  }
}

function getReminderRecoveryMessage(discarded: number): string {
  const details = discarded > 0 ? ' Alguns registros inválidos foram ignorados: ' + discarded + '.' : ''
  return 'Os lembretes salvos no aparelho foram ajustados para continuar funcionando.' + details + ' Uma cópia local dos dados anteriores foi preservada para recuperação.'
}

async function migrateReminderState(persistedState: unknown, version: number): Promise<ReminderStateProps> {
  try {
    const result = normalizeReminderPersistedState(persistedState, version)
    if (result.repaired) {
      reminderPersistence.blockWrites()
      const preserved = await preserveReminderData(persistedState)
      if (!preserved) throw new Error('A cópia de segurança dos dados não pôde ser criada.')
      PersistenceRecoveryService.report(getReminderRecoveryMessage(result.discarded))
      await reminderPersistence.allowWrites()
    }
    return result.data as ReminderStateProps
  } catch (error) {
    reminderPersistence.blockWrites()
    const preserved = await preserveReminderData(persistedState)
    if (preserved && version >= 0 && version <= 3) {
      PersistenceRecoveryService.report('Não foi possível validar os lembretes antigos. O conteúdo original foi preservado e uma coleção vazia foi preparada para continuar usando o aplicativo.')
      await reminderPersistence.allowWrites()
      return { reminders: [] } as ReminderStateProps
    }

    PersistenceRecoveryService.report(preserved
      ? 'A versão dos lembretes não é compatível com esta versão do aplicativo. O conteúdo original foi preservado e não será sobrescrito.'
      : 'Não foi possível validar nem preservar os dados locais dos lembretes. O armazenamento foi protegido contra sobrescrita.')
    console.error('Falha ao migrar os lembretes:', error)
    throw error
  }
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
          enabled: payload.enabled ?? current.enabled,
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
      storage: createJSONStorage(() => reminderPersistence.storage),
      version: 3,
      migrate: migrateReminderState,
      merge: (persistedState, currentState) => {
        if (persistedState === undefined) {
          void reminderPersistence.allowWrites()
          return currentState
        }

        try {
          const result = normalizeReminderPersistedState(persistedState, 3)
          if (result.repaired) {
            reminderPersistence.blockWrites()
            void preserveReminderData(persistedState).then(async (preserved) => {
              if (preserved) {
                PersistenceRecoveryService.report(getReminderRecoveryMessage(result.discarded))
                await reminderPersistence.allowWrites()
              } else {
                PersistenceRecoveryService.report('Os dados foram ajustados, mas a cópia de recuperação falhou. As alterações locais permanecerão protegidas contra sobrescrita.')
              }
            })
          } else {
            void reminderPersistence.allowWrites()
          }
          return { ...currentState, ...result.data }
        } catch (error) {
          reminderPersistence.blockWrites()
          void preserveReminderData(persistedState).then(async (preserved) => {
            PersistenceRecoveryService.report(preserved
              ? 'Não foi possível validar os dados locais. O conteúdo original foi preservado e não será sobrescrito até a cópia estar disponível.'
              : 'Não foi possível validar nem preservar os dados locais. O armazenamento foi protegido contra sobrescrita.')
            if (preserved) await reminderPersistence.allowWrites()
          })
          console.error('Falha ao hidratar os dados persistidos:', error)
          throw error
        }
      },
    },
  ),
)
