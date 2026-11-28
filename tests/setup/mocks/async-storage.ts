jest.mock('@react-native-async-storage/async-storage', () => {
  const mockAsyncStorage = jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock')
  return mockAsyncStorage
})
