import React from 'react'
import { Text } from 'react-native'
import { fireEvent, render } from '@testing-library/react-native'
import { Form } from '@/components/Form'

const mockPush = jest.fn()
const mockAdd = jest.fn()
const mockEdit = jest.fn()
const mockOk = jest.fn()
const mockDuplicate = jest.fn((_item: string, _products: unknown[], _editingId?: string) => false)
const mockCreateOrUpdateProduct = jest.fn((payload: { id: string; item: string; qtt: string; price: string; collected: boolean }) => ({
  id: payload.id,
  item: payload.item,
  quantity: payload.qtt,
  price: payload.price,
  collected: payload.collected,
}))

let mockInputValues: Record<string, string> = {
  Item: '',
  Quantidade: '',
  Preço: '',
}

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('react-native-uuid', () => ({
  v4: () => 'uuid-123',
}))

jest.mock('@/stores/CartStore', () => ({
  useCartStore: () => ({
    products: [{ id: '1', item: 'Arroz', quantity: '1', price: '10', collected: false }],
    add: mockAdd,
    edit: mockEdit,
  }),
}))

jest.mock('@/hooks/useInitAlert', () => ({
  useInitAlert: jest.fn(),
}))

jest.mock('@/components/CustomAlert', () => ({
  CustomAlert: () => null,
}))

jest.mock('@/components/Button', () => ({
  CustomButton: Object.assign(
    ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) => {
      const React = require('react')
      const { Pressable } = require('react-native')
      return <Pressable testID="form-submit" onPress={onPress}>{children}</Pressable>
    },
    {
      Text: ({ children }: { children: React.ReactNode }) => {
        const React = require('react')
        const { Text } = require('react-native')
        return <Text>{children}</Text>
      },
      Icon: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    }
  ),
}))

jest.mock('@/components/CustomInput', () => ({
  CustomInput: ({ nameField, setItem, onSubmit }: { nameField: string; setItem: (v: string) => void; onSubmit: () => void }) => {
    const React = require('react')
    const { Pressable, Text } = require('react-native')
    return (
      <>
        <Pressable testID={`set-${nameField}`} onPress={() => setItem(mockInputValues[nameField] || '')}>
          <Text>{nameField}</Text>
        </Pressable>
        <Pressable testID={`submit-${nameField}`} onPress={onSubmit}>
          <Text>{`${nameField}-submit`}</Text>
        </Pressable>
      </>
    )
  },
}))

jest.mock('@/services/AlertService', () => ({
  AlertService: {
    ok: (...args: unknown[]) => mockOk(...args),
  },
}))

jest.mock('@/services/ProductService', () => ({
  ProductService: {
    isDuplicateItem: (item: string, products: unknown[], editingId?: string) =>
      mockDuplicate(item, products, editingId),
    createOrUpdateProduct: (payload: { id: string; item: string; qtt: string; price: string; collected: boolean }) =>
      mockCreateOrUpdateProduct(payload),
  },
}))

describe('Form branch coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockInputValues = { Item: '', Quantidade: '', Preço: '' }
    mockDuplicate.mockReturnValue(false)
  })

  it('mostra erro quando item vazio', () => {
    mockInputValues = { Item: '   ', Quantidade: '1', Preço: '1' }

    const { getByTestId } = render(
      <Form buttonTitle="Salvar">
        <Text>+</Text>
      </Form>
    )

    fireEvent.press(getByTestId('set-Item'))
    fireEvent.press(getByTestId('set-Quantidade'))
    fireEvent.press(getByTestId('set-Preço'))
    fireEvent.press(getByTestId('form-submit'))

    expect(mockOk).toHaveBeenCalled()
    expect(mockAdd).not.toHaveBeenCalled()
    expect(mockEdit).not.toHaveBeenCalled()
  })

  it('mostra erro para valor negativo', () => {
    mockInputValues = { Item: 'Arroz', Quantidade: '-1', Preço: '2' }

    const { getByTestId } = render(
      <Form buttonTitle="Salvar">
        <Text>+</Text>
      </Form>
    )

    fireEvent.press(getByTestId('set-Item'))
    fireEvent.press(getByTestId('set-Quantidade'))
    fireEvent.press(getByTestId('set-Preço'))
    fireEvent.press(getByTestId('form-submit'))

    expect(mockOk).toHaveBeenCalled()
    expect(mockAdd).not.toHaveBeenCalled()
  })

  it('mostra erro quando item é duplicado', () => {
    mockInputValues = { Item: 'Arroz', Quantidade: '1', Preço: '2' }
    mockDuplicate.mockReturnValue(true)

    const { getByTestId } = render(
      <Form buttonTitle="Salvar">
        <Text>+</Text>
      </Form>
    )

    fireEvent.press(getByTestId('set-Item'))
    fireEvent.press(getByTestId('set-Quantidade'))
    fireEvent.press(getByTestId('set-Preço'))
    fireEvent.press(getByTestId('form-submit'))

    expect(mockOk).toHaveBeenCalled()
    expect(mockAdd).not.toHaveBeenCalled()
  })

  it('adiciona item quando dados são válidos', () => {
    mockInputValues = { Item: 'Feijão', Quantidade: '2', Preço: '8,90' }

    const { getByTestId } = render(
      <Form buttonTitle="Adicionar">
        <Text>+</Text>
      </Form>
    )

    fireEvent.press(getByTestId('set-Item'))
    fireEvent.press(getByTestId('set-Quantidade'))
    fireEvent.press(getByTestId('set-Preço'))
    fireEvent.press(getByTestId('form-submit'))

    expect(mockCreateOrUpdateProduct).toHaveBeenCalled()
    expect(mockAdd).toHaveBeenCalled()
    expect(mockEdit).not.toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('edita item quando data é fornecido', () => {
    const data = {
      id: '42',
      item: 'Macarrão',
      quantity: '1',
      price: '7.50',
      collected: true,
    }

    const { getByTestId } = render(
      <Form data={data} buttonTitle="Editar">
        <Text>*</Text>
      </Form>
    )

    fireEvent.press(getByTestId('form-submit'))

    expect(mockEdit).toHaveBeenCalled()
    expect(mockAdd).not.toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('executa callbacks de submit dos campos intermediários', () => {
    const { getByTestId } = render(
      <Form buttonTitle="Salvar">
        <Text>+</Text>
      </Form>
    )

    fireEvent.press(getByTestId('submit-Item'))
    fireEvent.press(getByTestId('submit-Quantidade'))

    expect(mockOk).not.toHaveBeenCalled()
    expect(mockAdd).not.toHaveBeenCalled()
    expect(mockEdit).not.toHaveBeenCalled()
  })
})
