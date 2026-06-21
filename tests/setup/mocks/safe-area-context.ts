import type { ReactNode } from 'react'

jest.mock('react-native-safe-area-context', () => {
  const SafeAreaView = ({ children }: { children?: ReactNode }) => children ?? null
  const SafeAreaProvider = ({ children }: { children?: ReactNode }) => children ?? null

  return {
    SafeAreaProvider,
    SafeAreaView,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    initialWindowMetrics: {
      frame: { x: 0, y: 0, width: 0, height: 0 },
      insets: { top: 0, bottom: 0, left: 0, right: 0 },
    },
  }
})
