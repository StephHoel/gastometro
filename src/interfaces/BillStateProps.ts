import type { BillProps } from '@/interfaces/BillProps'

export interface BillStateProps {
  bills: BillProps[]
  addBill: (bill: Omit<BillProps, 'id' | 'paid'>) => void
  updateBill: (id: string, bill: Omit<BillProps, 'id' | 'paid'>) => void
  setPaid: (id: string, paid: boolean) => void
  removeBill: (id: string) => void
}
