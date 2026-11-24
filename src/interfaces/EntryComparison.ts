import { PriceOption } from './PriceOption'

export interface EntryComparison {
  options: PriceOption[]
  lowest: PriceOption | null
  highest: PriceOption | null
  difference: number | null
  differencePercent: number | null
}
