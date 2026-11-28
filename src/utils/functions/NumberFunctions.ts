import { NormalizeNumericString, ParseToFloat } from './MathFunctions'

export function IsValidImportedNumber(value: string): boolean {
  const normalized = value.trim()

  if (normalized === '') return false
  if (normalized.includes('-')) return false

  return /^\d+(?:[.,]\d+)?$/.test(normalized)
}

export function NormalizePriceForComparison(price: string): string {
  return ParseToFloat(price).toString()
}

export function GetPriceNormalize(price: string): string {
  return NormalizeNumericString(price, '0.00', numberFormats)
}

export function GetQuantityNormalize(qtt: string): string {
  return NormalizeNumericString(qtt, '0', numberFormats)
}

const numberFormats = ['0', '0.0', '0.00', '0,0', '0,00']