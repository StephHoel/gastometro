import AsyncStorage from '@react-native-async-storage/async-storage'
import { createRecoveryAwareStorage } from '@/services/PersistenceStorage'

describe('PersistenceStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('mantém escritas em fila enquanto a recuperação está bloqueada', async () => {
    const persistence = createRecoveryAwareStorage()
    persistence.blockWrites()

    await persistence.storage.setItem('gastometro', '{"state":{"products":[]}}')
    expect(AsyncStorage.setItem).not.toHaveBeenCalled()

    await persistence.allowWrites()
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'gastometro',
      '{"state":{"products":[]}}',
    )
  })

  it('permite novas escritas após liberar a persistência', async () => {
    const persistence = createRecoveryAwareStorage()
    persistence.blockWrites()
    await persistence.allowWrites()
    await persistence.storage.setItem('gastometro', 'estado-atual')

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('gastometro', 'estado-atual')
  })
})
