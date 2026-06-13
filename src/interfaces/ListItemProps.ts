import type { ProductProps } from '@/interfaces/ProductProps'

export interface ListItemProps {
  product: ProductProps
  index: number
  totalCount: number
  onDelete: () => void
  onToggle: () => void
  onEdit: () => void
}