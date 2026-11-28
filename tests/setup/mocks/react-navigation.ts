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
