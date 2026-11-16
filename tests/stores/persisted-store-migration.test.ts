import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCartStore } from '@/stores/CartStore'
import { useReminderStore } from '@/stores/ReminderStore'

describe('Migrações dos stores persistidos', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    await AsyncStorage.clear()
  })

  it('migra o carrinho legado e preserva a versão anterior', async () => {
    const migrate = useCartStore.persist.getOptions().migrate
    expect(migrate).toBeDefined()

    const migrated = await migrate!({
      products: [{ id: 'p1', item: 'Arroz', quantity: '1', price: '10', collected: false }],
    }, 0)

    expect(migrated).toMatchObject({
      activeListId: 'lista-legada-1',
      products: [{ id: 'p1', item: 'Arroz' }],
    })
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'gastometro-recovery-cart',
      expect.stringContaining('Arroz'),
    )
  })

  it('migra lembretes válidos e preserva registros inválidos antes de repará-los', async () => {
    const migrate = useReminderStore.persist.getOptions().migrate
    expect(migrate).toBeDefined()

    const migrated = await migrate!({
      reminders: [
        {
          id: 'r1',
          title: 'Comprar leite',
          datetimeISO: '2099-01-01T10:00:00.000Z',
          enabled: true,
          listId: 'list-1',
          createdAt: '2098-01-01T10:00:00.000Z',
          updatedAt: '2098-01-01T10:00:00.000Z',
        },
        { id: 'invalid' },
      ],
    }, 1)

    expect(migrated.reminders).toHaveLength(1)
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'gastometro-recovery-reminders',
      expect.stringContaining('invalid'),
    )
  })

  it('não aceita versão futura e mantém cópia dos dados originais', async () => {
    const migrate = useCartStore.persist.getOptions().migrate
    await expect(migrate!({ lists: [] }, 99)).rejects.toThrow()
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'gastometro-recovery-cart',
      expect.stringContaining('lists'),
    )
  })
})
