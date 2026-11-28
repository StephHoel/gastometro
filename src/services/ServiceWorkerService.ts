import { ERROR } from '@/constants/text/error'
import { IsWeb } from '@/utils/platform'

const ROOT_PATH = '/'
const LOCALHOST_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1'])
const SW_DEV_ENABLED_VALUES = new Set(['1', 'true', 'yes', 'on'])

function normalizeBasePath(basePath: string): string {
  const trimmed = basePath.trim()
  if (!trimmed || trimmed === ROOT_PATH) return ROOT_PATH

  const withLeadingSlash = trimmed.startsWith(ROOT_PATH)
    ? trimmed
    : `${ROOT_PATH}${trimmed}`

  return withLeadingSlash.endsWith(ROOT_PATH)
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash
}

function isSecureRuntime(): boolean {
  if (typeof window === 'undefined') return false
  if (window.isSecureContext) return true

  const hostname = window.location.hostname
  return LOCALHOST_HOSTNAMES.has(hostname)
}

function canRegisterServiceWorker(): boolean {
  if (!IsWeb()) return false
  if (typeof window === 'undefined') return false
  if (typeof navigator === 'undefined') return false
  if (!('serviceWorker' in navigator)) return false

  return isSecureRuntime()
}

function getBasePath(): string {
  const runtimeBasePath = process.env.EXPO_PUBLIC_ROUTER_BASE
  return normalizeBasePath(runtimeBasePath ?? ROOT_PATH)
}

function isServiceWorkerEnabledInDev(): boolean {
  const rawValue = process.env.EXPO_PUBLIC_SW_DEV_ENABLED
  if (!rawValue) return false

  return SW_DEV_ENABLED_VALUES.has(rawValue.trim().toLowerCase())
}

export function getServiceWorkerRegistrationConfig() {
  const basePath = getBasePath()
  const scope = basePath === ROOT_PATH ? ROOT_PATH : `${basePath}${ROOT_PATH}`
  const scriptUrl = basePath === ROOT_PATH ? '/sw.js' : `${basePath}/sw.js`

  return { scope, scriptUrl }
}

let hasControllerChangeListener = false

function setupImmediateActivation(registration: ServiceWorkerRegistration) {
  if (!hasControllerChangeListener) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload()
    })
    hasControllerChangeListener = true
  }

  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
  }

  registration.addEventListener('updatefound', () => {
    const worker = registration.installing
    if (!worker) return

    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed' && navigator.serviceWorker.controller) {
        worker.postMessage({ type: 'SKIP_WAITING' })
      }
    })
  })
}

export const ServiceWorkerService = {
  async register(): Promise<boolean> {
    if (!canRegisterServiceWorker()) return false

    const isDevRuntime = typeof __DEV__ !== 'undefined' && __DEV__
    if (isDevRuntime && !isServiceWorkerEnabledInDev()) return false

    const { scope, scriptUrl } = getServiceWorkerRegistrationConfig()

    try {
      const registration = await navigator.serviceWorker.register(scriptUrl, { scope })
      setupImmediateActivation(registration)

      try {
        await registration.update()
      } catch (error) {
        console.warn(ERROR.service_worker_update_failure, error)
      }

      return true
    } catch (error) {
      console.error(ERROR.service_worker_register_failure, error)
      return false
    }
  },
}
