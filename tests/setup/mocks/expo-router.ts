import type { ReactNode } from 'react'

export const mockPush = jest.fn()

const mockUseRouter = jest.fn(() => ({ push: mockPush }))
const mockUseLocalSearchParams = jest.fn(() => ({}))

jest.mock('expo-router', () => {
  const MockScreen = () => null
  const MockContainer = ({ children }: { children?: ReactNode }) => children ?? null

  return {
    Stack: Object.assign(MockContainer, { Screen: MockScreen }),
    Tabs: Object.assign(MockContainer, { Screen: MockScreen }),
    useRouter: mockUseRouter,
    useLocalSearchParams: mockUseLocalSearchParams,
  }
})
