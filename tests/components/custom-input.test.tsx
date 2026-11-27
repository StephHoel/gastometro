import React, { createRef, useEffect } from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import type { TextInputInstance } from 'react-native'
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

async function renderCustomInput({
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
        returnKeyType={returnKeyType}
        onSubmit={jest.fn()}
        keyboardType={keyboardType}
      />
    )
  }

  return {
    ...await render(<TestComponent />),
    onValueChange,
  }
}

describe('CustomInput', () => {
  it('permite substituir o nome acessível padrão quando o contexto exigir', async () => {
    function ContextualInput() {
      const { control } = useForm<TestFormData>({ defaultValues: { value: '' } })
      return (
        <CustomInput
          control={control}
          name="value"
          nameField={NameField.Price}
          placeholder="Preço"
          accessibilityLabel="Preço da embalagem"
          accessibilityHint="Informe o preço total da embalagem"
          returnKeyType="done"
          onSubmit={jest.fn()}
        />
      )
    }

    const { getByLabelText } = await render(<ContextualInput />)
    expect(getByLabelText('Preço da embalagem').props.accessibilityHint).toBe(
      'Informe o preço total da embalagem',
    )
  })

  it('deve normalizar decimais quando campo for Preço', async () => {
    const { getByPlaceholderText, onValueChange } = await renderCustomInput({
      nameField: NameField.Price,
      placeholder: '1,39',
      returnKeyType: 'done',
      keyboardType: 'number-pad',
    })

    const input = getByPlaceholderText('1,39')
    await fireEvent.changeText(input, '12,3456')

    expect(onValueChange).toHaveBeenLastCalledWith('12.34')
  })

  it('deve manter texto livre quando campo for Item', async () => {
    const { getByPlaceholderText, onValueChange } = await renderCustomInput({
      nameField: NameField.Item,
      placeholder: 'Item',
      returnKeyType: 'next',
    })

    const input = getByPlaceholderText('Item')
    await fireEvent.changeText(input, 'Arroz integral')

    expect(onValueChange).toHaveBeenLastCalledWith('Arroz integral')
  })

  it('deve limpar zero automático no foco', async () => {
    const { getByPlaceholderText, onValueChange } = await renderCustomInput({
      nameField: NameField.Price,
      placeholder: '1,39',
      returnKeyType: 'done',
      initialValue: '0.00',
      keyboardType: 'number-pad',
    })

    const input = getByPlaceholderText('1,39')
    await fireEvent(input, 'focus')

    expect(onValueChange).toHaveBeenLastCalledWith('')
  })

  it('não deve limpar valor no foco quando não for zero', async () => {
    const { getByPlaceholderText, onValueChange } = await renderCustomInput({
      nameField: NameField.Quantity,
      placeholder: '1',
      returnKeyType: 'next',
      initialValue: '2',
      keyboardType: 'number-pad',
    })

    const input = getByPlaceholderText('1')
    await fireEvent(input, 'focus')

    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenLastCalledWith('2')
  })

  it('deve limitar decimais para Quantidade em 3 casas', async () => {
    const { getByPlaceholderText, onValueChange } = await renderCustomInput({
      nameField: NameField.Quantity,
      placeholder: '1',
      returnKeyType: 'done',
      keyboardType: 'number-pad',
    })

    const input = getByPlaceholderText('1')
    await fireEvent.changeText(input, '9,87654')

    expect(onValueChange).toHaveBeenLastCalledWith('9.876')
  })

  it('deve formatar Data no padrão yyyy-MM-dd com separadores automáticos', async () => {
    const { getByPlaceholderText, onValueChange } = await renderCustomInput({
      nameField: NameField.Date,
      placeholder: 'yyyy-MM-dd',
      returnKeyType: 'done',
      keyboardType: 'number-pad',
    })

    const input = getByPlaceholderText('yyyy-MM-dd')
    await fireEvent.changeText(input, '2026030a5')

    expect(onValueChange).toHaveBeenLastCalledWith('2026-03-05')
  })

  it('deve formatar Hora no padrão HH:mm com dois-pontos automático', async () => {
    const { getByPlaceholderText, onValueChange } = await renderCustomInput({
      nameField: NameField.Time,
      placeholder: 'HH:mm',
      returnKeyType: 'done',
      keyboardType: 'number-pad',
    })

    const input = getByPlaceholderText('HH:mm')
    await fireEvent.changeText(input, '12h3:4')

    expect(onValueChange).toHaveBeenLastCalledWith('12:34')
  })
})
