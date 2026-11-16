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

async function preserveCartData(value: unknown): Promise<boolean> {
  try {
    await AsyncStorage.setItem(CART_RECOVERY_KEY, JSON.stringify(value))
    return true
  } catch (error) {
    PersistenceRecoveryService.report('Não foi possível criar uma cópia de recuperação dos dados do carrinho. Evite limpar os dados do aplicativo e procure suporte.')
    console.error('Falha ao preservar dados do carrinho:', error)
    return false
  }
}

function getCartRecoveryMessage(discarded: number): string {
  const details = discarded > 0 ? ' Registros inválidos ignorados: ' + discarded + '.' : ''
  return 'Os dados locais da lista foram ajustados para manter a integridade.' + details + ' Uma cópia anterior foi preservada em ' + CART_RECOVERY_KEY + '.'
}

async function migrateCartState(persistedState: unknown, version: number): Promise<StateProps> {
  try {
    const result = normalizeCartPersistedState(persistedState, version)
    if (result.repaired) {
      const preserved = await preserveCartData(persistedState)
      if (!preserved) throw new Error('A cópia de segurança dos dados não pôde ser criada.')
      PersistenceRecoveryService.report(getCartRecoveryMessage(result.discarded))
    }
    return result.data as StateProps
  } catch (error) {
    const preserved = await preserveCartData(persistedState)
    PersistenceRecoveryService.report(preserved
      ? 'Não foi possível validar os dados locais da lista. O conteúdo original foi preservado para recuperação. Evite limpar os dados do aplicativo.'
      : 'Não foi possível validar nem criar uma cópia dos dados locais da lista. Evite limpar os dados do aplicativo e procure suporte.')
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
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: migrateCartState,
      merge: (persistedState, currentState) => {
        try {
          const result = normalizeCartPersistedState(persistedState, 2)
          if (result.repaired) {
            void preserveCartData(persistedState).then((preserved) => {
              PersistenceRecoveryService.report(preserved
                ? getCartRecoveryMessage(result.discarded)
                : 'A recuperação dos dados foi parcial e a cópia de segurança não pôde ser criada. Evite limpar os dados do aplicativo.')
            })
          }
          return { ...currentState, ...result.data }
        } catch (error) {
          void preserveCartData(persistedState).then((preserved) => {
            PersistenceRecoveryService.report(preserved ? 'Os dados locais da lista não puderam ser validados. O estado inicial foi mantido e uma cópia do conteúdo anterior foi preservada para recuperação.' : 'Os dados locais da lista não puderam ser validados e a cópia de recuperação falhou. Evite limpar os dados do aplicativo.')
          })
          console.error('Falha ao hidratar o carrinho:', error)
          return currentState
        }
      },
    },
  ),
)
