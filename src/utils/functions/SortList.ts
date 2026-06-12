import { ProductProps } from "@/interfaces/ProductProps"

export function SortProductsAlphabetically(products: ProductProps[]) {
  return [...products].sort((a, b) =>
    a.item.toLowerCase().localeCompare(b.item.toLowerCase())
  )
}

export function SortProductsByCollected(products: ProductProps[]) {
  return {
    notCollected: SortProductsAlphabetically(
      products.filter((product) => !product.collected),
    ),
    collected: SortProductsAlphabetically(
      products.filter((product) => product.collected),
    ),
  }
}
