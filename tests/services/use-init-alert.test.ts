import React, { createRef } from 'react'
import { render } from '@testing-library/react-native'
import { useInitAlert } from '@/hooks/useInitAlert'
import { AlertService } from '@/services/AlertService'
import type { CustomAlertRef } from '@/components/CustomAlert'

function Harness({ refValue }: { refValue: React.RefObject<CustomAlertRef | null> | null }) {
  useInitAlert(refValue)
  return null
}

describe('useInitAlert', () => {
  it('deve inicializar AlertService quando ref.current existir', () => {
    const initSpy = jest.spyOn(AlertService, 'init').mockImplementation(() => undefined)
    const ref = createRef<CustomAlertRef | null>()
    ref.current = {
      showAlert: jest.fn(),
      hideAlert: jest.fn(),
    }

    render(React.createElement(Harness, { refValue: ref }))

    expect(initSpy).toHaveBeenCalledTimes(1)
    expect(initSpy).toHaveBeenCalledWith(ref.current)
  })

  it('não deve inicializar quando ref for nulo', () => {
    const initSpy = jest.spyOn(AlertService, 'init').mockImplementation(() => undefined)

    render(React.createElement(Harness, { refValue: null }))

    expect(initSpy).not.toHaveBeenCalled()
  })
})
