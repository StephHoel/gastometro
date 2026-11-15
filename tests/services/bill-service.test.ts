import { formatBillAmount, isBillOverdue, isValidBillDueDate, validateBill } from '@/services/BillService'
import type { BillProps } from '@/interfaces/BillProps'

describe('BillService', () => {
  it('validates required fields, positive amount and optional valid date', () => {
    expect(validateBill('', '10', '')).not.toBeNull()
    expect(validateBill('Luz', '', '')).not.toBeNull()
    expect(validateBill('Luz', '-10', '')).not.toBeNull()
    expect(validateBill('Luz', '0', '')).not.toBeNull()
    expect(validateBill('Luz', '10,50', '2026-02-30')).not.toBeNull()
    expect(validateBill(' Luz ', '10,50', '')).toBeNull()
    expect(validateBill('Luz', '10.50', '2026-02-28')).toBeNull()
  })

  it('accepts only real ISO calendar dates', () => {
    expect(isValidBillDueDate('')).toBe(true)
    expect(isValidBillDueDate('2024-02-29')).toBe(true)
    expect(isValidBillDueDate('2025-02-29')).toBe(false)
  })

  it('formats amount using BRL locale', () => {
    expect(formatBillAmount('1234,56')).toContain('1.234,56')
  })

  it('marks only unpaid past-due bills as overdue', () => {
    const bill: BillProps = { id: '1', title: 'Luz', amount: '100', dueDate: '2026-01-01', paid: false }
    expect(isBillOverdue(bill, new Date(2026, 0, 2))).toBe(true)
    expect(isBillOverdue({ ...bill, paid: true }, new Date(2026, 0, 2))).toBe(false)
    expect(isBillOverdue({ ...bill, dueDate: undefined }, new Date(2026, 0, 2))).toBe(false)
  })
})
