import { act } from '@testing-library/react-native'
import { useBillStore } from '@/stores/BillStore'

describe('BillStore', () => {
  beforeEach(() => {
    act(() => {
      useBillStore.setState({ bills: [] })
    })
  })

  it('creates, edits, marks paid and removes bills independently', () => {
    act(() => useBillStore.getState().addBill({ title: 'Internet', amount: '120.5', dueDate: '2026-12-01' }))
    const created = useBillStore.getState().bills[0]
    expect(created).toMatchObject({ title: 'Internet', amount: '120.5', dueDate: '2026-12-01', paid: false })
    expect(created.id).toBeTruthy()

    act(() => useBillStore.getState().updateBill(created.id, { title: 'Internet fibra', amount: '130' }))
    expect(useBillStore.getState().bills[0]).toMatchObject({ title: 'Internet fibra', amount: '130', dueDate: '2026-12-01' })

    act(() => useBillStore.getState().setPaid(created.id, true))
    expect(useBillStore.getState().bills[0].paid).toBe(true)

    act(() => useBillStore.getState().removeBill(created.id))
    expect(useBillStore.getState().bills).toHaveLength(0)
  })
})
