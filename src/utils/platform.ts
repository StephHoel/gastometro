import { Platform } from 'react-native'

export const isWeb = Platform.OS === 'web'
export const isNative = !isWeb

export const isAndroid = Platform.OS === 'android'
export const isIOS = Platform.OS === 'ios'

export function IsWeb(): boolean {
  return Platform.OS === 'web'
}

/**
 * Detecta se o app está rodando em ambiente web
 */
export function detectWeb() {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

/**
 * Fallback seguro para APIs não disponíveis em web
 */
export function withWebFallback<T>(
  nativeFunction: () => Promise<T>,
  webFunction?: () => Promise<T>,
  fallbackValue?: T
): Promise<T | undefined> {
  if (isWeb && webFunction) {
    return webFunction()
  }

  if (isWeb) {
    return Promise.resolve(fallbackValue)
  }

  return nativeFunction()
}
