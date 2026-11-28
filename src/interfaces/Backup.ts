import type { ProductProps } from './ProductProps'
import type { ShoppingListProps } from './ShoppingListProps'
import type { ReminderProps } from './ReminderProps'
import type { BillProps } from './BillProps'
import type { PriceComparisonEntryProps, PriceComparisonPlaceProps } from './PriceComparisonProps'
import { BACKUP_FORMAT } from '@/constants/backup'
export interface BackupPayload {
  cart: { lists: ShoppingListProps[]; activeListId: string; products: ProductProps[] }
  reminders: ReminderProps[]
  bills: BillProps[]
  priceComparison: { places: PriceComparisonPlaceProps[]; entries: PriceComparisonEntryProps[] }
}
export interface BackupEnvelope { format: typeof BACKUP_FORMAT; version: number; exportedAt: string; appVersion: string; payload: BackupPayload }
export interface BackupSummary {
  exportedAt: string; lists: number; products: number; reminders: number
  bills: number; comparisonPlaces: number; comparisonEntries: number
}
export interface BackupConflict {
  id: string; type: 'lista' | 'produto' | 'lembrete' | 'conta' | 'local' | 'comparacao'; description: string; localValue: string; backupValue: string
}
export interface MergeResult {
  payload: BackupPayload; conflicts: BackupConflict[]
  merged: { lists: number; products: number; reminders: number; bills: number; comparisonPlaces: number; comparisonEntries: number }
  ignored: { lists: number; products: number; reminders: number; bills: number; comparisonPlaces: number; comparisonEntries: number }
}
export type ConflictChoices = Record<string, 'local' | 'backup'>
