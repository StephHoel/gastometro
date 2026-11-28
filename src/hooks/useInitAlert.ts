import { useEffect } from 'react'
import type { RefObject } from 'react'
import { useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import { AlertService } from '@/services/AlertService'
import type { CustomAlertRef } from '@/interfaces/CustomAlertRef'
import { ERROR } from '@/constants/text/error'

export function useInitAlert(ref: RefObject<CustomAlertRef | null> | null) {
  const initAlert = useCallback(() => {
    try {
      if (!ref) return
      if (ref.current) {
        AlertService.init(ref.current)
      }
    } catch (error) {
      console.error(ERROR.alert_init_failure, error)
    }
  }, [ref])

  useEffect(() => {
    initAlert()
  }, [initAlert])

  useFocusEffect(
    useCallback(() => {
      initAlert()
    }, [initAlert]),
  )
}
