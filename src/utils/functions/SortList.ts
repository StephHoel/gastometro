import { ProductProps } from "@/interfaces/ProductProps"

export function SortProductsAlphabetically(products: ProductProps[]) {
  return [...products].sort((a, b) =>
    a.item.toLowerCase().localeCompare(b.item.toLowerCase())
  )
}
