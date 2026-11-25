import AsyncStorage from '@react-native-async-storage/async-storage'
import { PendingWrite } from '@/interfaces/PendingWrite'

/**
 * Impede que uma hidratação inválida sobrescreva os dados originais.
 * Escritas solicitadas enquanto a cópia de recuperação é criada ficam em fila.
 */
export function createRecoveryAwareStorage() {
  let writesAllowed = true
  let pendingWrite: PendingWrite | null = null
  const originalValues = new Map<string, string>()

  return {
    storage: {
      getItem: async (key: string) => {
        const value = await AsyncStorage.getItem(key)
        if (value !== null) originalValues.set(key, value)
        return value
      },
      setItem: async (key: string, value: string) => {
        if (!writesAllowed) {
          pendingWrite = { key, value }
          return
        }
        await AsyncStorage.setItem(key, value)
      },
      removeItem: async (key: string) => {
        if (!writesAllowed) return
        await AsyncStorage.removeItem(key)
      },
    },
    takeOriginalValue(key: string) {
      const value = originalValues.get(key)
      originalValues.delete(key)
      return value
    },
    blockWrites() {
      writesAllowed = false
    },
    async allowWrites() {
      const write = pendingWrite
      if (write) {
        try {
          await AsyncStorage.setItem(write.key, write.value)
          pendingWrite = null
        } catch (error) {
          writesAllowed = false
          throw error
        }
      }
      writesAllowed = true
    },
  }
}
