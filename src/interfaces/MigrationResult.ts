export interface MigrationResult<T> {
  data: T
  repaired: boolean
  discarded: number
}
