import type { BillProps } from '@/interfaces/BillProps'
import type { BillStateProps } from '@/interfaces/BillStateProps'
import AsyncStorage from '@react-native-async-storage/async-storage'
import uuid from 'react-native-uuid'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const useBillStore = create(
  persist<BillStateProps>(
    (set) => ({
      bills: [],
      addBill: (bill) => set((state) => ({
        bills: [...state.bills, { ...bill, id: uuid.v4().toString(), paid: false }],
      })),
      updateBill: (id, bill) => set((state) => ({
        bills: state.bills.map((current) => current.id === id ? { ...current, ...bill } : current),
      })),
      setPaid: (id, paid) => set((state) => ({
        bills: state.bills.map((bill) => bill.id === id ? { ...bill, paid } : bill),
      })),
      removeBill: (id) => set((state) => ({
        bills: state.bills.filter((bill) => bill.id !== id),
      })),
    }),
    {
      name: 'gastometro-bills',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
)
