import { useEffect } from 'react'
import type { RefObject } from 'react'
import { AlertService } from '@/services/AlertService'
import type { CustomAlertRef } from '@/interfaces/CustomAlertRef'

export function useInitAlert(ref: RefObject<CustomAlertRef | null> | null) {
  useEffect(() => {
    try {
      if (!ref) return
      if (ref.current) {
        AlertService.init(ref.current)
      }
    } catch (error) {
      console.error('Falha ao inicializar alerta customizado:', error)
    }
  }, [ref])
}
