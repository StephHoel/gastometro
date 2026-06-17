import '@testing-library/jest-native/extend-expect'

import './mocks/uuid'
import './mocks/async-storage'
import './mocks/expo-router'
import './mocks/react-navigation'
import './mocks/safe-area-context'
import './mocks/expo-notifications'


beforeEach(() => { jest.clearAllMocks() })

afterEach(async () => {
  const asyncStorageModule = require('@react-native-async-storage/async-storage')
  const AsyncStorage = asyncStorageModule.default ?? asyncStorageModule
  await AsyncStorage.clear()
})
