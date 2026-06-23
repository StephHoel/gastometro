import React, { createRef, useEffect } from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import type { TextInput } from 'react-native'
import { CustomInput } from '@/components/CustomInput'
import { NameField } from '@/enums/NameField'
import { useForm } from 'react-hook-form'

interface TestFormData {
  value: string
}

interface RenderCustomInputParams {
  nameField: NameField
  placeholder: string
  returnKeyType: 'next' | 'done'
  initialValue?: string
  keyboardType?: 'default' | 'number-pad'
}

function renderCustomInput({
  nameField,
  placeholder,
  returnKeyType,
  initialValue = '',
  keyboardType = 'default',
}: RenderCustomInputParams) {
  const onValueChange = jest.fn()

  function TestComponent() {
    const { control, watch } = useForm<TestFormData>({
      defaultValues: {
        value: initialValue,
      },
    })

    const currentValue = watch('value')

    useEffect(() => {
      onValueChange(currentValue)
    }, [currentValue])

    return (
      <CustomInput
        control={control}
        name="value"
        nameField={nameField}
        placeholder={placeholder}
        selfRef={createRef<TextInput | null>()}
        returnKeyType={returnKeyType}
        onSubmit={jest.fn()}
        keyboardType={keyboardType}
      />
    )
  }

  return {
    ...render(<TestComponent />),
    onValueChange,
  }
}

describe('CustomInput', () => {
  it('deve normalizar decimais quando campo for Preço', () => {
    const { getByPlaceholderText, onValueChange } = renderCustomInput({
      nameField: NameField.Price,
      placeholder: '1,39',
      returnKeyType: 'done',
      keyboardType: 'number-pad',
    })

    const input = getByPlaceholderText('1,39')
    fireEvent.changeText(input, '12,3456')

    expect(onValueChange).toHaveBeenLastCalledWith('12.34')
  })

  it('deve manter texto livre quando campo for Item', () => {
    const { getByPlaceholderText, onValueChange } = renderCustomInput({
      nameField: NameField.Item,
      placeholder: 'Item',
      returnKeyType: 'next',
    })

    const input = getByPlaceholderText('Item')
    fireEvent.changeText(input, 'Arroz integral')

    expect(onValueChange).toHaveBeenLastCalledWith('Arroz integral')
  })

  it('deve limpar zero automático no foco', () => {
    const { getByPlaceholderText, onValueChange } = renderCustomInput({
      nameField: NameField.Price,
      placeholder: '1,39',
      returnKeyType: 'done',
      initialValue: '0.00',
      keyboardType: 'number-pad',
    })

    const input = getByPlaceholderText('1,39')
    fireEvent(input, 'focus')

    expect(onValueChange).toHaveBeenLastCalledWith('')
  })

  it('não deve limpar valor no foco quando não for zero', () => {
    const { getByPlaceholderText, onValueChange } = renderCustomInput({
      nameField: NameField.Quantity,
      placeholder: '1',
      returnKeyType: 'next',
      initialValue: '2',
      keyboardType: 'number-pad',
    })

    const input = getByPlaceholderText('1')
    fireEvent(input, 'focus')

    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenLastCalledWith('2')
  })

  it('deve limitar decimais para Quantidade em 3 casas', () => {
    const { getByPlaceholderText, onValueChange } = renderCustomInput({
      nameField: NameField.Quantity,
      placeholder: '1',
      returnKeyType: 'done',
      keyboardType: 'number-pad',
    })

    const input = getByPlaceholderText('1')
    fireEvent.changeText(input, '9,87654')

    expect(onValueChange).toHaveBeenLastCalledWith('9.876')
  })

  it('deve formatar Data no padrão yyyy-MM-dd com separadores automáticos', () => {
    const { getByPlaceholderText, onValueChange } = renderCustomInput({
      nameField: NameField.Date,
      placeholder: 'yyyy-MM-dd',
      returnKeyType: 'done',
      keyboardType: 'number-pad',
    })

    const input = getByPlaceholderText('yyyy-MM-dd')
    fireEvent.changeText(input, '2026030a5')

    expect(onValueChange).toHaveBeenLastCalledWith('2026-03-05')
  })

  it('deve formatar Hora no padrão HH:mm com dois-pontos automático', () => {
    const { getByPlaceholderText, onValueChange } = renderCustomInput({
      nameField: NameField.Time,
      placeholder: 'HH:mm',
      returnKeyType: 'done',
      keyboardType: 'number-pad',
    })

    const input = getByPlaceholderText('HH:mm')
    fireEvent.changeText(input, '12h3:4')

    expect(onValueChange).toHaveBeenLastCalledWith('12:34')
  })
})
