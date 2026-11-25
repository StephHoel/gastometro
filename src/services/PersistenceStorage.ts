import AsyncStorage from '@react-native-async-storage/async-storage'

interface PendingWrite {
  key: string
  value: string
}

/**
 * Impede que uma hidratação inválida sobrescreva os dados originais.
 * Escritas solicitadas enquanto a cópia de recuperação é criada ficam em fila.
 */
export function createRecoveryAwareStorage() {
  let writesAllowed = true
  let pendingWrite: PendingWrite | null = null

  return {
    storage: {
      getItem: (key: string) => AsyncStorage.getItem(key),
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
