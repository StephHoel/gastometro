import type { ProductProps } from "@/interfaces/ProductProps"
import { SetCurrency, ParseToFloat } from '@/utils/functions/MathFunctions'

export function FormatTextLine(prod: ProductProps): string {
    return `${prod.quantity}x ${prod.item} | ${SetCurrency(ParseToFloat(prod.price))}`
}

export function ToTitleCase(text: string): string {
    return text
        .trim()
        .split(' ')
        .map((word) => (word.length === 0 ? '' : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()))
        .join(' ')
}
