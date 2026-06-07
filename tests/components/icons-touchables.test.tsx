import React from 'react'
import { render } from '@testing-library/react-native'

jest.mock('react-native-svg', () => {
  const React = require('react')
  const { View } = require('react-native')
  const Mock = ({ children }: { children?: React.ReactNode }) => <View>{children}</View>

  return {
    __esModule: true,
    default: Mock,
    Circle: Mock,
    Line: Mock,
    Path: Mock,
    Rect: Mock,
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
  it('deve renderizar os ícones base sem quebrar', () => {
    expect(() => render(
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

  it('deve renderizar os botões de ícone sem quebrar', () => {
    const { toJSON } = render(
      <>
        <Add action={jest.fn()} />
        <Back action={jest.fn()} />
        <Delete action={jest.fn()} />
        <Share action={jest.fn()} />
      </>
    )

    expect(toJSON()).toBeTruthy()
  })
})
