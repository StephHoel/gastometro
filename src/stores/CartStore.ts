import type { ProductProps } from '@/interfaces/ProductProps'
import type { ShoppingListProps } from '@/interfaces/ShoppingListProps'
import type { StateProps } from '@/interfaces/StateProps'
import * as CartInMemory from '@/stores/helpers/CartInMemory'
import AsyncStorage from '@react-native-async-storage/async-storage'
import uuid from 'react-native-uuid'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

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
          const newList: ShoppingListProps = {
            id: uuid.v4().toString(),
            name: name.trim() || 'Nova Lista',
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

      setActiveList: (listId: string) =>
        set((state) => {
          const exists = state.lists.some((l) => l.id === listId)
          if (!exists) return {}
          return {
            activeListId: listId,
            products: getActiveProducts(state.lists, listId),
          }
        }),
    }),
    {
      name: 'gastometro',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (persistedState: unknown, version: number): StateProps => {
        if (version === 0) {
          const old = persistedState as { products?: ProductProps[] }
          const defaultList = createDefaultList(old.products ?? [])
          return {
            lists: [defaultList],
            activeListId: defaultList.id,
            products: defaultList.products,
          } as StateProps
        }
        return persistedState as StateProps
      },
    },
  ),
)
