import React from 'react'
import type { ReactNode } from 'react'
import { fireEvent, render } from '@testing-library/react-native'

jest.mock('react-native-svg', () => {
  const ReactModule = jest.requireActual('react') as typeof import('react')
  const { View } = jest.requireActual('react-native') as typeof import('react-native')
  const Mock = ({ children }: { children?: ReactNode }) => <View>{children}</View>

  return {
    __esModule: true,
    default: ReactModule.memo(Mock),
    Circle: ReactModule.memo(Mock),
    Line: ReactModule.memo(Mock),
    Path: ReactModule.memo(Mock),
    Rect: ReactModule.memo(Mock),
  }
})

import {
  AddIcon,
  BackIcon,
  CalculatorIcon,
  CheckboxIcon,
  EditIcon,
  HomeIcon,
  ShareIcon,
  TrashIcon,
  WhatsappIcon,
} from '@/components/Icons'
import { Add, Back, Delete, Share } from '@/components/TouchableIcons'

describe('Icons and TouchableIcons', () => {
  it('deve renderizar os ícones base sem quebrar', async () => {
    expect(async () => await render(
      <>
        <AddIcon />
        <BackIcon />
        <CalculatorIcon />
        <CheckboxIcon checked />
        <CheckboxIcon checked={false} />
        <EditIcon />
        <HomeIcon />
        <ShareIcon />
        <TrashIcon />
        <WhatsappIcon />
      </>
    )).not.toThrow()
  })

  it('expõe nomes acessíveis e executa ações dos botões de ícone', async () => {
    const actions = {
      add: jest.fn(),
      back: jest.fn(),
      remove: jest.fn(),
      share: jest.fn(),
    }
    const { getByRole } = await render(
      <>
        <Add action={actions.add} accessibilityLabel="Adicionar produto" />
        <Back action={actions.back} accessibilityLabel="Voltar para a lista" />
        <Delete
          action={actions.remove}
          accessibilityLabel="Remover produto Arroz"
          accessibilityHint="Remove Arroz da lista"
        />
        <Share action={actions.share} accessibilityLabel="Compartilhar lista atual" />
      </>
    )

    const addButton = getByRole('button', { name: 'Adicionar produto' })
    const backButton = getByRole('button', { name: 'Voltar para a lista' })
    const removeButton = getByRole('button', { name: 'Remover produto Arroz' })
    const shareButton = getByRole('button', { name: 'Compartilhar lista atual' })

    expect(removeButton.props.accessibilityHint).toBe('Remove Arroz da lista')
    await fireEvent.press(addButton)
    await fireEvent.press(backButton)
    await fireEvent.press(removeButton)
    await fireEvent.press(shareButton)

    expect(actions.add).toHaveBeenCalledTimes(1)
    expect(actions.back).toHaveBeenCalledTimes(1)
    expect(actions.remove).toHaveBeenCalledTimes(1)
    expect(actions.share).toHaveBeenCalledTimes(1)
  })
})
