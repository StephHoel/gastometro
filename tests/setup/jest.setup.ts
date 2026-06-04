import '@testing-library/jest-native/extend-expect'
import AsyncStorage from '@react-native-async-storage/async-storage'

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

beforeEach(() => {
  jest.clearAllMocks()
})

afterEach(async () => {
  await AsyncStorage.clear()
})
