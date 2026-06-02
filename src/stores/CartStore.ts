import type { ProductProps } from '@/interfaces/ProductProps'
import type { StateProps } from '@/interfaces/StateProps'
import * as CartInMemory from '@/stores/helpers/CartInMemory'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const useCartStore = create(
  persist<StateProps>(
    (set, get) => ({
      products: [],

      add: (product: ProductProps) =>
        set((state: StateProps) => ({
          products: CartInMemory.add(state.products, product),
        })),
      replace: (products: ProductProps[]) =>
        set(() => ({
          products: CartInMemory.replace(products),
        })),
      remove: (productId: string) =>
        set((state: StateProps) => ({
          products: CartInMemory.remove(state.products, productId),
        })),
      edit: (product: ProductProps) =>
        set((state: StateProps) => ({
          products: CartInMemory.edit(state.products, product),
        })),
      get: (productId: string) => {
        const products = get().products
        return products.find((product) => product.id === productId)
      },
      clear: () => set(() => ({ products: [] })),
    }),
    { name: 'gastometro', storage: createJSONStorage(() => AsyncStorage) },
  ),
)
