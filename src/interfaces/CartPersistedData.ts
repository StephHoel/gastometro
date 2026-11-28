import { ProductProps } from './ProductProps'
import { ShoppingListProps } from './ShoppingListProps'

export interface CartPersistedData {
  lists: ShoppingListProps[]
  activeListId: string
  products: ProductProps[]
}
