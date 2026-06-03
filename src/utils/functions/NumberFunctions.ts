export function IsValidImportedNumber(value: string): boolean {
  const normalized = value.trim()

  if (normalized === '') return false
  if (normalized.includes('-')) return false

  return /^\d+(?:[.,]\d+)?$/.test(normalized)
}