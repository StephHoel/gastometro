import '@testing-library/jest-native/extend-expect'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { ReactNode } from 'react'

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

jest.mock('expo-router', () => {
  const MockScreen = () => null
  const MockContainer = ({ children }: { children?: ReactNode }) => children ?? null

  return {
    Stack: Object.assign(MockContainer, { Screen: MockScreen }),
    Tabs: Object.assign(MockContainer, { Screen: MockScreen }),
    useRouter: jest.fn(() => ({ push: jest.fn() })),
    useLocalSearchParams: jest.fn(() => ({})),
  }
})

jest.mock('expo-router/react-navigation', () => ({
  useRoute: jest.fn(() => ({ name: 'index' })),
  useTheme: jest.fn(() => ({
    colors: {
      background: '#0f172a',
      border: '#ffffff',
      card: '#0f172a',
      notification: '#ffffff',
      primary: '#ffffff',
      text: '#ffffff',
    },
  })),
}))

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

jest.mock('expo-notifications', () => ({
  PermissionStatus: {
    DENIED: 'denied',
  },
  SchedulableTriggerInputTypes: {
    DATE: 'date',
  },
  getPermissionsAsync: jest.fn(async () => ({ granted: false, status: 'undetermined' })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: false, status: 'denied' })),
  scheduleNotificationAsync: jest.fn(async () => 'notification-id'),
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  getLastNotificationResponseAsync: jest.fn(async () => null),
  setNotificationHandler: jest.fn(),
}))

beforeEach(() => {
  jest.clearAllMocks()
})

afterEach(async () => {
  await AsyncStorage.clear()
})
