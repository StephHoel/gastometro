import React from 'react'
import type { ReactNode } from 'react'
import { render } from '@testing-library/react-native'

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
