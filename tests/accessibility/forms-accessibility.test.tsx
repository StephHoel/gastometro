import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import { useForm } from 'react-hook-form'
import { CustomInput } from '@/components/CustomInput'
import { NameField } from '@/enums/NameField'

interface FormValues {
  title: string
  amount: string
}

function AccessibleForm() {
  const { control } = useForm<FormValues>({
    defaultValues: { title: '', amount: '' },
  })

  return (
    <>
      <CustomInput
        control={control}
        name="title"
        nameField={NameField.Title}
        placeholder="Nome da conta"
        accessibilityLabel="Nome da conta"
        accessibilityHint="Informe um nome que identifique a conta"
        returnKeyType="next"
        onSubmit={jest.fn()}
      />
      <CustomInput
        control={control}
        name="amount"
        nameField={NameField.Price}
        placeholder="0,00"
        accessibilityLabel="Valor da conta"
        accessibilityHint="Informe o valor total da conta"
        keyboardType="decimal-pad"
        returnKeyType="done"
        onSubmit={jest.fn()}
      />
    </>
  )
}

describe('Acessibilidade dos formulários', () => {
  it('expõe nomes e instruções contextuais em todos os campos', async () => {
    const screen = await render(<AccessibleForm />)

    expect(screen.getByLabelText('Nome da conta').props.accessibilityHint).toBe(
      'Informe um nome que identifique a conta',
    )
    expect(screen.getByLabelText('Valor da conta').props.accessibilityHint).toBe(
      'Informe o valor total da conta',
    )
  })

  it('mantém os campos identificáveis durante a edição dos valores', async () => {
    const screen = await render(<AccessibleForm />)
    const title = screen.getByLabelText('Nome da conta')
    const amount = screen.getByLabelText('Valor da conta')

    await fireEvent.changeText(title, 'Internet')
    await fireEvent.changeText(amount, '89,90')

    expect(screen.getByLabelText('Nome da conta').props.value).toBe('Internet')
    expect(screen.getByLabelText('Valor da conta').props.value).toBe('89.90')
  })

  it('usa rótulo acessível padrão quando o formulário não fornece contexto específico', async () => {
    function DefaultLabelForm() {
      const { control } = useForm<{ title: string }>({ defaultValues: { title: '' } })
      return (
        <CustomInput
          control={control}
          name="title"
          nameField={NameField.Title}
          placeholder="Título do lembrete"
          returnKeyType="done"
          onSubmit={jest.fn()}
        />
      )
    }

    const screen = await render(<DefaultLabelForm />)
    expect(screen.getByLabelText(String(NameField.Title)).props.accessibilityHint).toBe(
      'Título do lembrete',
    )
  })
})
