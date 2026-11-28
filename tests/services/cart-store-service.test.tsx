import { CartStoreService } from '@/services/CartStoreService'
import { useCartStore } from '@/stores/CartStore'

jest.mock('@/stores/CartStore', () => ({
  useCartStore: jest.fn(),
}))

describe('CartStoreService', () => {
  it('deve delegar para useCartStore', () => {
    const mockedStore = { products: [] }
    const useCartStoreMock = useCartStore as unknown as jest.Mock
    useCartStoreMock.mockReturnValue(mockedStore)

    const result = CartStoreService.getCartStore()

    expect(result).toBe(mockedStore)
    expect(useCartStoreMock).toHaveBeenCalledTimes(1)
  })
})
