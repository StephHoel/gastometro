import { useListIdParam, useReminderIdParam } from '@/hooks/useParams'
import { useLocalSearchParams } from 'expo-router'

describe('getParams hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('useListIdParam retorna listId quando parametro e string', () => {
    ; (useLocalSearchParams as jest.Mock).mockReturnValue({ listId: 'list-123' })

    expect(useListIdParam()).toBe('list-123')
  })

  it('useListIdParam retorna vazio quando parametro nao e string', () => {
    ; (useLocalSearchParams as jest.Mock).mockReturnValue({ listId: 123 })

    expect(useListIdParam()).toBe('')
  })

  it('useReminderIdParam retorna reminderId quando parametro e string', () => {
    ; (useLocalSearchParams as jest.Mock).mockReturnValue({ reminderId: 'rem-123' })

    expect(useReminderIdParam()).toBe('rem-123')
  })

  it('useReminderIdParam retorna vazio quando parametro nao e string', () => {
    ; (useLocalSearchParams as jest.Mock).mockReturnValue({ reminderId: null })

    expect(useReminderIdParam()).toBe('')
  })
})
