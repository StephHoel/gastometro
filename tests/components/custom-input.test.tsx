import { createElement } from 'react'
import { createRef } from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import type { TextInput } from 'react-native'
import { CustomInput } from '@/components/CustomInput'
import { NameField } from '@/enums/NameField'

describe('CustomInput', () => {
  it('deve normalizar decimais quando campo for Preço', () => {
    const setItem = jest.fn()

    const { getByPlaceholderText } = render(
      createElement(CustomInput, {
        nameField: NameField.Price,
        placeholder: '1,39',
        selfRef: createRef<TextInput | null>(),
        returnKeyType: 'done',
        setItem,
        item: '',
        onSubmit: jest.fn(),
        keyboardType: 'number-pad',
      })
    )

    const input = getByPlaceholderText('1,39')
    fireEvent.changeText(input, '12,3456')

    expect(setItem).toHaveBeenCalledWith('12.34')
  })

  it('deve manter texto livre quando campo for Item', () => {
    const setItem = jest.fn()

    const { getByPlaceholderText } = render(
      createElement(CustomInput, {
        nameField: NameField.Item,
        placeholder: 'Item',
        selfRef: createRef<TextInput | null>(),
        returnKeyType: 'next',
        setItem,
        item: '',
        onSubmit: jest.fn(),
      })
    )

    const input = getByPlaceholderText('Item')
    fireEvent.changeText(input, 'Arroz integral')

    expect(setItem).toHaveBeenCalledWith('Arroz integral')
  })

  it('deve limpar zero automático no foco', () => {
    const setItem = jest.fn()

    const { getByPlaceholderText } = render(
      createElement(CustomInput, {
        nameField: NameField.Price,
        placeholder: '1,39',
        selfRef: createRef<TextInput | null>(),
        returnKeyType: 'done',
        setItem,
        item: '0.00',
        onSubmit: jest.fn(),
        keyboardType: 'number-pad',
      })
    )

    const input = getByPlaceholderText('1,39')
    fireEvent(input, 'focus')

    expect(setItem).toHaveBeenCalledWith('')
  })

  it('não deve limpar valor no foco quando não for zero', () => {
    const setItem = jest.fn()

    const { getByPlaceholderText } = render(
      createElement(CustomInput, {
        nameField: NameField.Quantity,
        placeholder: '1',
        selfRef: createRef<TextInput | null>(),
        returnKeyType: 'next',
        setItem,
        item: '2',
        onSubmit: jest.fn(),
        keyboardType: 'number-pad',
      })
    )

    const input = getByPlaceholderText('1')
    fireEvent(input, 'focus')

    expect(setItem).not.toHaveBeenCalled()
  })

  it('deve limitar decimais para Quantidade em 3 casas', () => {
    const setItem = jest.fn()

    const { getByPlaceholderText } = render(
      createElement(CustomInput, {
        nameField: NameField.Quantity,
        placeholder: '1',
        selfRef: createRef<TextInput | null>(),
        returnKeyType: 'done',
        setItem,
        item: '',
        onSubmit: jest.fn(),
        keyboardType: 'number-pad',
      })
    )

    const input = getByPlaceholderText('1')
    fireEvent.changeText(input, '9,87654')

    expect(setItem).toHaveBeenCalledWith('9.876')
  })

  it('deve formatar Data no padrão yyyy-MM-dd com separadores automáticos', () => {
    const setItem = jest.fn()

    const { getByPlaceholderText } = render(
      createElement(CustomInput, {
        nameField: NameField.Date,
        placeholder: 'yyyy-MM-dd',
        selfRef: createRef<TextInput | null>(),
        returnKeyType: 'done',
        setItem,
        item: '',
        onSubmit: jest.fn(),
        keyboardType: 'number-pad',
      })
    )

    const input = getByPlaceholderText('yyyy-MM-dd')
    fireEvent.changeText(input, '2026030a5')

    expect(setItem).toHaveBeenCalledWith('2026-03-05')
  })

  it('deve formatar Hora no padrão HH:mm com dois-pontos automático', () => {
    const setItem = jest.fn()

    const { getByPlaceholderText } = render(
      createElement(CustomInput, {
        nameField: NameField.Time,
        placeholder: 'HH:mm',
        selfRef: createRef<TextInput | null>(),
        returnKeyType: 'done',
        setItem,
        item: '',
        onSubmit: jest.fn(),
        keyboardType: 'number-pad',
      })
    )

    const input = getByPlaceholderText('HH:mm')
    fireEvent.changeText(input, '12h3:4')

    expect(setItem).toHaveBeenCalledWith('12:34')
  })
})
