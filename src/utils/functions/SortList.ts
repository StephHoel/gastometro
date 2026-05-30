import { ProductProps } from "@/interfaces/ProductProps"

export function SortProductsAlphabetically(this: ProductProps[]) {
    return [...this].sort((a, b) =>
        a.item.toLowerCase().localeCompare(b.item.toLowerCase())
    )
}
