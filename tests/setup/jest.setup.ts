import '@testing-library/jest-native/extend-expect'

import './mocks/uuid'
import './mocks/async-storage'
import './mocks/expo-router'
import './mocks/react-navigation'
import './mocks/safe-area-context'
import './mocks/expo-notifications'


beforeEach(() => { jest.clearAllMocks() })

afterEach(async () => {
  const asyncStorageModule = jest.requireMock('@react-native-async-storage/async-storage') as {
    default?: { clear: () => Promise<void> }
    clear?: () => Promise<void>
  }
  const AsyncStorage = (asyncStorageModule.default ?? asyncStorageModule) as { clear: () => Promise<void> }
  await AsyncStorage.clear()
})
