import { getListIdParam, getReminderIdParam } from '@/hooks/getParams'
import { useLocalSearchParams } from 'expo-router'

describe('getParams hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('getListIdParam retorna listId quando parametro e string', () => {
    ; (useLocalSearchParams as jest.Mock).mockReturnValue({ listId: 'list-123' })

    expect(getListIdParam()).toBe('list-123')
  })

  it('getListIdParam retorna vazio quando parametro nao e string', () => {
    ; (useLocalSearchParams as jest.Mock).mockReturnValue({ listId: 123 })

    expect(getListIdParam()).toBe('')
  })

  it('getReminderIdParam retorna reminderId quando parametro e string', () => {
    ; (useLocalSearchParams as jest.Mock).mockReturnValue({ reminderId: 'rem-123' })

    expect(getReminderIdParam()).toBe('rem-123')
  })

  it('getReminderIdParam retorna vazio quando parametro nao e string', () => {
    ; (useLocalSearchParams as jest.Mock).mockReturnValue({ reminderId: null })

    expect(getReminderIdParam()).toBe('')
  })
})
