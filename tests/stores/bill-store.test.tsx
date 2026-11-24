import { act } from '@testing-library/react-native'
import uuid from 'react-native-uuid'
import { useBillStore } from '@/stores/BillStore'

describe('BillStore', () => {
  let uuidCounter = 0

  beforeEach(async () => {
    uuidCounter = 0
    jest.mocked(uuid.v4).mockImplementation(() => [++uuidCounter])
    await act(() => {
      useBillStore.setState({ bills: [] })
    })
  })

  it('creates, edits, marks paid and removes bills independently', async () => {
    await act(() => useBillStore.getState().addBill({ title: 'Internet', amount: '120.5', dueDate: '2026-12-01' }))
    await act(() => useBillStore.getState().addBill({ title: 'Água', amount: '40' }))
    const created = useBillStore.getState().bills[0]
    expect(created).toMatchObject({ title: 'Internet', amount: '120.5', dueDate: '2026-12-01', paid: false })
    expect(created.id).toBeTruthy()

    await act(() => useBillStore.getState().updateBill(created.id, { title: 'Internet fibra', amount: '130' }))
    expect(useBillStore.getState().bills[0]).toMatchObject({ title: 'Internet fibra', amount: '130', dueDate: '2026-12-01' })

    await act(() => useBillStore.getState().setPaid(created.id, true))
    expect(useBillStore.getState().bills[0].paid).toBe(true)

    await act(() => useBillStore.getState().updateBill('missing', { title: 'Não existe', amount: '0' }))
    await act(() => useBillStore.getState().setPaid('missing', true))
    await act(() => useBillStore.getState().removeBill('missing'))
    expect(useBillStore.getState().bills[1]).toMatchObject({ title: 'Água', paid: false })

    await act(() => useBillStore.getState().removeBill(created.id))
    expect(useBillStore.getState().bills).toHaveLength(1)
  })
})
