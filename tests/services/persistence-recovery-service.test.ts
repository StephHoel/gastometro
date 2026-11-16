import { PersistenceRecoveryService } from '@/services/PersistenceRecoveryService'

describe('PersistenceRecoveryService', () => {
  beforeEach(() => PersistenceRecoveryService.dismiss())

  it('notifica assinantes e mantém avisos até serem dispensados', () => {
    const listener = jest.fn()
    const unsubscribe = PersistenceRecoveryService.subscribe(listener)

    PersistenceRecoveryService.report('Carrinho recuperado')
    PersistenceRecoveryService.report('Lembretes recuperados')

    expect(PersistenceRecoveryService.getMessage()).toContain('Carrinho recuperado')
    expect(PersistenceRecoveryService.getMessage()).toContain('Lembretes recuperados')
    expect(listener).toHaveBeenLastCalledWith(expect.stringContaining('Lembretes recuperados'))

    PersistenceRecoveryService.dismiss()
    expect(listener).toHaveBeenLastCalledWith(null)
    unsubscribe()
  })
})
