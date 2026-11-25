import type { ProductProps } from '@/interfaces/ProductProps'
import type { ShoppingListProps } from '@/interfaces/ShoppingListProps'
import type { StateProps } from '@/interfaces/StateProps'
import * as CartInMemory from '@/stores/helpers/CartInMemory'
import AsyncStorage from '@react-native-async-storage/async-storage'
import uuid from 'react-native-uuid'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { normalizeCartPersistedState } from '@/services/PersistenceMigrationService'
import { PersistenceRecoveryService } from '@/services/PersistenceRecoveryService'
import { createRecoveryAwareStorage } from '@/services/PersistenceStorage'

function createDefaultList(products: ProductProps[] = []): ShoppingListProps {
  return { id: uuid.v4().toString(), name: 'Lista 1', products }
}

function getActiveProducts(lists: ShoppingListProps[], activeListId: string): ProductProps[] {
  return lists.find((l) => l.id === activeListId)?.products ?? []
}

function updateActiveListProducts(
  lists: ShoppingListProps[],
  activeListId: string,
  updater: (products: ProductProps[]) => ProductProps[],
): ShoppingListProps[] {
  return lists.map((l) =>
    l.id === activeListId ? { ...l, products: updater(l.products) } : l,
  )
}

const initialList = createDefaultList()

const CART_RECOVERY_KEY = 'gastometro-recovery-cart'
const cartPersistence = createRecoveryAwareStorage()

async function preserveCartData(value: unknown): Promise<boolean> {
  try {
    const originalValue = cartPersistence.takeOriginalValue('gastometro')
    await AsyncStorage.setItem(CART_RECOVERY_KEY, originalValue ?? JSON.stringify(value))
    return true
  } catch (error) {
    PersistenceRecoveryService.report('Não foi possível criar uma cópia de recuperação dos dados do carrinho. Evite limpar os dados do aplicativo e procure suporte.')
    console.error('Falha ao preservar dados do carrinho:', error)
    return false
  }
}

function getCartRecoveryMessage(discarded: number): string {
  const details = discarded > 0 ? ' Alguns registros inválidos foram ignorados: ' + discarded + '.' : ''
  return 'As listas e os produtos salvos no aparelho foram ajustados para continuar funcionando.' + details + ' Uma cópia local dos dados anteriores foi preservada para recuperação.'
}

async function migrateCartState(persistedState: unknown, version: number): Promise<StateProps> {
  try {
    const result = normalizeCartPersistedState(persistedState, version)
    if (result.repaired) {
      cartPersistence.blockWrites()
      const preserved = await preserveCartData(persistedState)
      if (!preserved) throw new Error('A cópia de segurança dos dados não pôde ser criada.')
      PersistenceRecoveryService.report(getCartRecoveryMessage(result.discarded))
      await cartPersistence.allowWrites()
    }
    return result.data as StateProps
  } catch (error) {
    cartPersistence.blockWrites()
    const preserved = await preserveCartData(persistedState)
    if (preserved && version >= 0 && version <= 3) {
      PersistenceRecoveryService.report('Não foi possível validar os dados antigos da lista. O conteúdo original foi preservado e uma lista vazia foi preparada para continuar usando o aplicativo.')
      const recovered = normalizeCartPersistedState({ lists: [], activeListId: '', products: [] }, 3)
      await cartPersistence.allowWrites()
      return recovered.data as StateProps
    }

    PersistenceRecoveryService.report(preserved
      ? 'A versão dos dados da lista não é compatível com esta versão do aplicativo. O conteúdo original foi preservado e não será sobrescrito.'
      : 'Não foi possível validar nem preservar os dados locais da lista. O armazenamento foi protegido contra sobrescrita.')
    console.error('Falha ao migrar os dados do carrinho:', error)
    throw error
  }
}

export const useCartStore = create(
  persist<StateProps>(
    (set, get) => ({
      lists: [initialList],
      activeListId: initialList.id,
      products: [],

      add: (product: ProductProps) =>
        set((state) => {
          const lists = updateActiveListProducts(state.lists, state.activeListId, (p) =>
            CartInMemory.add(p, product),
          )
          return { lists, products: getActiveProducts(lists, state.activeListId) }
        }),

      replace: (products: ProductProps[]) =>
        set((state) => {
          const lists = updateActiveListProducts(state.lists, state.activeListId, () =>
            CartInMemory.replace(products),
          )
          return { lists, products: getActiveProducts(lists, state.activeListId) }
        }),

      remove: (productId: string) =>
        set((state) => {
          const lists = updateActiveListProducts(state.lists, state.activeListId, (p) =>
            CartInMemory.remove(p, productId),
          )
          return { lists, products: getActiveProducts(lists, state.activeListId) }
        }),

      edit: (product: ProductProps) =>
        set((state) => {
          const lists = updateActiveListProducts(state.lists, state.activeListId, (p) =>
            CartInMemory.edit(p, product),
          )
          return { lists, products: getActiveProducts(lists, state.activeListId) }
        }),

      get: (productId: string) => {
        const products = get().products
        return products.find((product) => product.id === productId)
      },

      clear: () =>
        set((state) => {
          const lists = updateActiveListProducts(state.lists, state.activeListId, () => [])
          return { lists, products: [] }
        }),

      addList: (name: string, initialProducts: ProductProps[] = []) =>
        set((state) => {
          const trimmed = name.trim()
          if (!trimmed) return {}

          const newList: ShoppingListProps = {
            id: uuid.v4().toString(),
            name: trimmed,
            products: CartInMemory.replace(initialProducts),
          }
          return {
            lists: [...state.lists, newList],
            activeListId: newList.id,
            products: newList.products,
          }
        }),

      removeList: (listId: string) =>
        set((state) => {
          if (state.lists.length <= 1) return {}

          const lists = state.lists.filter((l) => l.id !== listId)
          if (lists.length === 0) return {}

          const activeListId =
            state.activeListId === listId ? lists[0].id : state.activeListId
          return { lists, activeListId, products: getActiveProducts(lists, activeListId) }
        }),

      renameList: (listId: string, name: string) =>
        set((state) => {
          const trimmed = name.trim()
          if (!trimmed) return {}
          return {
            lists: state.lists.map((l) =>
              l.id === listId ? { ...l, name: trimmed } : l,
            ),
          }
        }),

      setActiveList: (listId: string) => {
        const state = get()
        const exists = state.lists.some((l) => l.id === listId)
        if (!exists || state.activeListId === listId) return

        set({
          activeListId: listId,
          products: getActiveProducts(state.lists, listId),
        })
      },
    }),
    {
      name: 'gastometro',
      storage: createJSONStorage(() => cartPersistence.storage),
      version: 3,
      migrate: migrateCartState,
      merge: (persistedState, currentState) => {
        if (persistedState === undefined) {
          void cartPersistence.allowWrites()
          return currentState
        }

        try {
          const result = normalizeCartPersistedState(persistedState, 3)
          if (result.repaired) {
            cartPersistence.blockWrites()
            void preserveCartData(persistedState).then(async (preserved) => {
              if (preserved) {
                PersistenceRecoveryService.report(getCartRecoveryMessage(result.discarded))
                await cartPersistence.allowWrites()
              } else {
                PersistenceRecoveryService.report('Os dados foram ajustados, mas a cópia de recuperação falhou. As alterações locais permanecerão protegidas contra sobrescrita.')
              }
            })
          } else {
            void cartPersistence.allowWrites()
          }
          return { ...currentState, ...result.data }
        } catch (error) {
          cartPersistence.blockWrites()
          void preserveCartData(persistedState).then(async (preserved) => {
            PersistenceRecoveryService.report(preserved
              ? 'Não foi possível validar os dados locais. O conteúdo original foi preservado e não será sobrescrito até a cópia estar disponível.'
              : 'Não foi possível validar nem preservar os dados locais. O armazenamento foi protegido contra sobrescrita.')
            if (preserved) await cartPersistence.allowWrites()
          })
          console.error('Falha ao hidratar os dados persistidos:', error)
          throw error
        }
      },
    },
  ),
)
