import type { ProductProps } from '@/interfaces/ProductProps'

export interface ShoppingListProps {
  id: string
  name: string
  products: ProductProps[]
}
