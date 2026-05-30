import { useEffect } from 'react'
import type { CustomAlertRef } from '@/components/CustomAlert'
import { AlertService } from '@/services/AlertService'

export function useInitAlert(ref: React.RefObject<CustomAlertRef | null> | null) {
    useEffect(() => {
        if (!ref) return
        if (ref.current) {
            AlertService.init(ref.current)
        }
    }, [])
}
