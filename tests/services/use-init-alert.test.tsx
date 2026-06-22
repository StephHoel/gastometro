import { createElement, createRef } from 'react'
import type { RefObject } from 'react'
import { render } from '@testing-library/react-native'
import { useInitAlert } from '@/hooks/useInitAlert'
import { AlertService } from '@/services/AlertService'
import type { CustomAlertRef } from '@/interfaces/CustomAlertRef'
import { useFocusEffect } from 'expo-router'

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
}))

function Harness({ refValue }: { refValue: RefObject<CustomAlertRef | null> | null }) {
  useInitAlert(refValue)
  return null
}

describe('useInitAlert', () => {
  const focusEffectMock = useFocusEffect as jest.Mock
  let focusCallback: (() => void) | undefined

  beforeEach(() => {
    jest.clearAllMocks()
    focusCallback = undefined
    focusEffectMock.mockImplementation((callback: () => void) => {
      focusCallback = callback
    })
  })

  it('deve inicializar AlertService quando ref.current existir', () => {
    const initSpy = jest.spyOn(AlertService, 'init').mockImplementation(() => undefined)
    const ref = createRef<CustomAlertRef | null>()
    ref.current = {
      showAlert: jest.fn(),
      hideAlert: jest.fn(),
    }

    render(createElement(Harness, { refValue: ref }))

    expect(initSpy).toHaveBeenCalledTimes(1)
    expect(initSpy).toHaveBeenCalledWith(ref.current)
  })

  it('deve reinicializar AlertService ao focar a tela novamente', () => {
    const initSpy = jest.spyOn(AlertService, 'init').mockImplementation(() => undefined)
    const ref = createRef<CustomAlertRef | null>()
    ref.current = {
      showAlert: jest.fn(),
      hideAlert: jest.fn(),
    }

    render(createElement(Harness, { refValue: ref }))

    expect(focusCallback).toBeDefined()

    focusCallback?.()

    expect(initSpy).toHaveBeenCalledTimes(2)
    expect(initSpy).toHaveBeenLastCalledWith(ref.current)
  })

  it('não deve inicializar quando ref for nulo', () => {
    const initSpy = jest.spyOn(AlertService, 'init').mockImplementation(() => undefined)

    render(createElement(Harness, { refValue: null }))

    expect(initSpy).not.toHaveBeenCalled()
  })
})
