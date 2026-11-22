import React from 'react'
import { render } from '@testing-library/react-native'
import NotFound from '@/app/+not-found'

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => {
    const ReactModule = jest.requireActual('react') as typeof import('react')
    const { Text: NativeText } = jest.requireActual('react-native') as typeof import('react-native')
    return ReactModule.createElement(NativeText, null, children)
  },
}))

jest.mock('@/components/Screen', () => ({
  Screen: ({ children }: { children: React.ReactNode }) => {
    const ReactModule = jest.requireActual('react') as typeof import('react')
    const { View: NativeView } = jest.requireActual('react-native') as typeof import('react-native')
    return ReactModule.createElement(NativeView, null, children)
  },
}))

describe('NotFound screen', () => {
  it('informa que a página não existe e oferece retorno ao início', async () => {
    const screen = await render(<NotFound />)
    expect(screen.getByText('Página não encontrada')).toBeTruthy()
    expect(screen.getByText('O endereço acessado não corresponde a uma página do Gastômetro.')).toBeTruthy()
    expect(screen.getByText('Voltar ao início')).toBeTruthy()
  })
})
