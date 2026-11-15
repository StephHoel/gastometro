import type { BillProps } from '@/interfaces/BillProps'
import { ParseToFloat, SetCurrency } from '@/utils/functions/MathFunctions'

export function isValidBillDueDate(value: string): boolean {
  if (!value) return true
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function validateBill(title: string, amount: string, dueDate: string): string | null {
  if (!title.trim()) return 'Informe o nome da conta.'
  if (!amount.trim()) return 'Informe o valor da conta.'
  if (amount.includes('-') || !/^(?:\d+(?:[.,]\d{1,2})?|\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?)$/.test(amount.trim()) || !Number.isFinite(ParseToFloat(amount)) || ParseToFloat(amount) < 0)
    return 'Informe um valor válido, sem números negativos.'
  if (!isValidBillDueDate(dueDate)) return 'Informe uma data de vencimento válida (AAAA-MM-DD).'
  return null
}

export function formatBillAmount(amount: string): string {
  return SetCurrency(ParseToFloat(amount))
}

export function isBillOverdue(bill: BillProps, today = new Date()): boolean {
  if (bill.paid || !bill.dueDate) return false
  const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const [year, month, day] = bill.dueDate.split('-').map(Number)
  const dueDate = new Date(year, month - 1, day)
  return dueDate < currentDate
}
