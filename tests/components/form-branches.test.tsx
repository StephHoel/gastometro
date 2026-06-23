import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react-native'
import { Text } from 'react-native'
import { Form } from '@/components/Form'
import { useCartStore } from '@/stores/CartStore'
import { useRouter } from 'expo-router'

const mockPush = jest.fn()

describe('Form branch coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
      ; (useRouter as jest.Mock).mockReturnValue({ push: mockPush })

    useCartStore.setState({
      lists: [
        {
          id: 'list-1',
          name: 'Lista 1',
          products: [{ id: '1', item: 'Arroz', quantity: '1', price: '10', collected: false }],
        },
      ],
      activeListId: 'list-1',
      products: [{ id: '1', item: 'Arroz', quantity: '1', price: '10', collected: false }],
    })
  })

  it('não adiciona item quando nome está vazio', async () => {
    const { getByPlaceholderText, getByText } = render(
      <Form buttonTitle="Salvar">
        <Text>+</Text>
      </Form>,
    )

    fireEvent.changeText(getByPlaceholderText('1'), '1')
    fireEvent.changeText(getByPlaceholderText('1,39'), '2')

    await waitFor(() => {
      fireEvent.press(getByText('Salvar'))
    })

    expect(useCartStore.getState().products).toHaveLength(1)
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('não adiciona item com valor negativo', async () => {
    const { getByPlaceholderText, getByText } = render(
      <Form buttonTitle="Salvar">
        <Text>+</Text>
      </Form>,
    )

    fireEvent.changeText(getByPlaceholderText('Item'), 'Feijão')
    fireEvent.changeText(getByPlaceholderText('1'), '-1')
    fireEvent.changeText(getByPlaceholderText('1,39'), '2')

    await waitFor(() => {
      fireEvent.press(getByText('Salvar'))
    })

    expect(useCartStore.getState().products).toHaveLength(1)
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('não adiciona item duplicado', async () => {
    const { getByPlaceholderText, getByText } = render(
      <Form buttonTitle="Salvar">
        <Text>+</Text>
      </Form>,
    )

    fireEvent.changeText(getByPlaceholderText('Item'), 'Arroz')
    fireEvent.changeText(getByPlaceholderText('1'), '2')
    fireEvent.changeText(getByPlaceholderText('1,39'), '3')

    await waitFor(() => {
      fireEvent.press(getByText('Salvar'))
    })

    expect(useCartStore.getState().products).toHaveLength(1)
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('adiciona item quando dados são válidos', async () => {
    const { getByPlaceholderText, getByText } = render(
      <Form buttonTitle="Adicionar">
        <Text>+</Text>
      </Form>,
    )

    fireEvent.changeText(getByPlaceholderText('Item'), 'Feijao')
    fireEvent.changeText(getByPlaceholderText('1'), '2')
    fireEvent.changeText(getByPlaceholderText('1,39'), '8,90')

    await waitFor(() => {
      fireEvent.press(getByText('Adicionar'))
    })

    await waitFor(() => {
      const products = useCartStore.getState().products
      expect(products).toHaveLength(2)
      expect(products.some((product) => product.item === 'Feijao')).toBe(true)
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('edita item quando data é fornecida', async () => {
    const data = {
      id: '1',
      item: 'Arroz',
      quantity: '1',
      price: '10',
      collected: false,
    }

    const { getByPlaceholderText, getByText } = render(
      <Form data={data} buttonTitle="Editar">
        <Text>*</Text>
      </Form>,
    )

    await waitFor(() => {
      expect(getByPlaceholderText('Item').props.value).toBe('Arroz')
    })

    fireEvent.changeText(getByPlaceholderText('Item'), 'Macarrao')
    fireEvent.changeText(getByPlaceholderText('1'), '3')
    fireEvent.changeText(getByPlaceholderText('1,39'), '7')

    await waitFor(() => {
      fireEvent.press(getByText('Editar'))
    })

    await waitFor(() => {
      const updated = useCartStore.getState().products.find((product) => product.id === '1')
      expect(updated?.item).toBe('Macarrao')
      expect(updated?.quantity).toBe('3')
      expect(updated?.price).toBe('7')
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })
})
