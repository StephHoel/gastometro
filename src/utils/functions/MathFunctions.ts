import type { ProductProps } from "@/interfaces/ProductProps"
import type { StateProps } from "@/interfaces/StateProps"

export function ParseToFloat(value: string | number): number {
  if (typeof value === 'number')
    return Number.isFinite(value) ? value : 0

  if (!value || typeof value !== 'string') return 0

  if (value.includes('-')) return 0

  let s = value.trim().replace(/[^0-9.,]/g, '')

  const hasComma = s.indexOf(',') !== -1
  const hasDot = s.indexOf('.') !== -1

  if (hasComma && hasDot) {
    // Formato comum pt-BR: '.' milhares e ',' decimal -> remover pontos e trocar vírgula
    s = s.replace(/\./g, '').replace(/,/g, '.')
  } else if (hasComma) {
    // Só vírgula: substitui por ponto
    s = s.replace(/,/g, '.')
  }

  const n = Number.parseFloat(s)
  return Number.isFinite(n) ? n : 0
}

export function HasNegativeSignal(value: string): boolean {
  return value.includes('-')
}

export function NormalizeDecimalInput(text: string, maxDecimals: number): string {
  let filtered = text.replace(/[^0-9.,]/g, "")

  const sep = filtered.includes(",")
    ? ","
    : filtered.includes(".")
      ? "."
      : ""

  const [intPart, ...rest] = filtered.split(/[.,]/)
  let decimalPart = rest.join("")

  if (sep) {
    decimalPart = decimalPart.slice(0, maxDecimals)
    filtered = `${intPart}.${decimalPart}`
  } else {
    filtered = intPart
  }

  return filtered
}

export function NormalizeNumericString(
  value: string,
  zeroValue: string,
  explicitZeroInputs: string[]
): string {
  const parsedValue = ParseToFloat(value)
  const trimmed = value.replace(/\s/g, '')

  if (parsedValue === 0 && !explicitZeroInputs.includes(trimmed)) return zeroValue

  return parsedValue.toString()
}

export function Multiply(value1: string | number, value2: string | number): number {
  return ParseToFloat(value1) * ParseToFloat(value2)
}

export function Divide(value1: string | number, value2: string | number): number {
  const denom = ParseToFloat(value2)

  if (denom === 0) return 0

  return ParseToFloat(value1) / denom
}

export function SetCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function ReduceProducts(cartStore: StateProps): number {
  return cartStore.products.reduce(
    (acc: number, currentItem: ProductProps) =>
      acc + Multiply(currentItem.quantity, currentItem.price),
    0
  )
}