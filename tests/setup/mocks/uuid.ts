jest.mock('react-native-uuid', () => ({
  __esModule: true,
  default: {
    v4: jest.fn(() => 'uuid-123'),
  },
}))
