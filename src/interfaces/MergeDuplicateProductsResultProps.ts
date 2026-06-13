import type { ProductProps } from './ProductProps'

export interface MergeDuplicateProductsResultProps {
  mergedProduct: ProductProps
  removedIds: string[]
}