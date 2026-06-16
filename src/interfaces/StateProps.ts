import type { ProductProps } from '@/interfaces/ProductProps'
import type { ShoppingListProps } from '@/interfaces/ShoppingListProps'

export interface StateProps {
  lists: ShoppingListProps[]
  activeListId: string
  products: ProductProps[]

  add: (product: ProductProps) => void
  edit: (product: ProductProps) => void
  replace: (products: ProductProps[]) => void
  remove: (productId: string) => void
  get: (productId: string) => ProductProps | undefined
  clear: () => void

  addList: (name: string, initialProducts?: ProductProps[]) => void
  removeList: (listId: string) => void
  renameList: (listId: string, name: string) => void
  setActiveList: (listId: string) => void
}