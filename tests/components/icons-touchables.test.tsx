import React from 'react'
import { render } from '@testing-library/react-native'

jest.mock('@expo/vector-icons/Ionicons', () => {
  return {
    __esModule: true,
    default: () => null,
  }
})

jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => {
  return {
    __esModule: true,
    default: () => null,
  }
})

import {
  AddIcon,
  BackIcon,
  BroomIcon,
  CalculatorIcon,
  CheckboxIcon,
  DeleteIcon,
  EditIcon,
  HomeIcon,
  ShareIcon,
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
        <BroomIcon />
        <CheckboxIcon checked />
        <CheckboxIcon checked={false} />
        <DeleteIcon />
        <EditIcon />
        <HomeIcon />
        <ShareIcon />
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
