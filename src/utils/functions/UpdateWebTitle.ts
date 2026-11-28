import { TITLES } from '@/constants/titles'
import { isNative } from '../platform'

export function updateWebTitle(path: string) {
  if (isNative) return

  document.title = TITLES[path] ?? "Gastômetro"
}
