import type { ProductProps } from '@/interfaces/ProductProps';

export interface StateProps {
  products: ProductProps[]
  add: (product: ProductProps) => void
  edit: (product: ProductProps) => void
  replace: (products: ProductProps[]) => void
  remove: (productId: string) => void
  get: (productId: string) => ProductProps | undefined
  clear: () => void
}