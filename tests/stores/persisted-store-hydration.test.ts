import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCartStore } from '@/stores/CartStore'
import { useReminderStore } from '@/stores/ReminderStore'

const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('Hidratação real dos stores persistidos', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    await AsyncStorage.clear()
  })

  it('hidrata o carrinho atual e reconstrói o espelho da lista ativa', async () => {
    await AsyncStorage.setItem('gastometro', JSON.stringify({
      state: {
        lists: [
          { id: 'list-1', name: 'Lista 1', products: [{ id: 'p1', item: 'Arroz', quantity: '1', price: '5', collected: false }] },
          { id: 'list-2', name: 'Lista 2', products: [{ id: 'p2', item: 'Feijão', quantity: '2', price: '8', collected: false }] },
        ],
        activeListId: 'list-2',
        products: [],
      },
      version: 3,
    }))

    useCartStore.persist.rehydrate()
    await tick()

    expect(useCartStore.getState().activeListId).toBe('list-2')
    expect(useCartStore.getState().products).toEqual(useCartStore.getState().lists[1]?.products)
    expect(useCartStore.getState().products[0]?.item).toBe('Feijão')
  })

  it('hidrata os lembretes atuais com campos opcionais ausentes', async () => {
    await AsyncStorage.setItem('gastometro-reminders', JSON.stringify({
      state: {
        reminders: [{
          id: 'r1',
          title: 'Comprar leite',
          datetimeISO: '2099-01-01T10:00:00.000Z',
          listId: 'list-1',
        }],
      },
      version: 3,
    }))

    useReminderStore.persist.rehydrate()
    await tick()

    expect(useReminderStore.getState().reminders).toHaveLength(1)
    expect(useReminderStore.getState().reminders[0]).toMatchObject({
      id: 'r1',
      enabled: true,
      createdAt: '2099-01-01T10:00:00.000Z',
      updatedAt: '2099-01-01T10:00:00.000Z',
    })
  })

  it('preserva dados malformados e bloqueia a sobrescrita após falha de hidratação', async () => {
    const raw = JSON.stringify({
      state: { lists: {}, activeListId: 'missing', products: 'inválido' },
      version: 3,
    })
    await AsyncStorage.setItem('gastometro', raw)
    ;(AsyncStorage.setItem as jest.Mock).mockClear()

    useCartStore.persist.rehydrate()
    await tick()

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('gastometro-recovery-cart', raw)
    expect(AsyncStorage.setItem).not.toHaveBeenCalledWith('gastometro', expect.any(String))
  })
})
