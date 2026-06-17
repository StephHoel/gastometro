import React from 'react'
import { render } from '@testing-library/react-native'
import { Text } from 'react-native'
import { Form } from '@/components/Form'
import Add from '@/app/list/add'
import Edit from '@/app/list/edit/[id]'
import Home from '@/app/index'
import { useCartStore } from '@/stores/CartStore'
import { useLocalSearchParams, useRouter } from 'expo-router'

describe('Form, Calculator and routes', () => {
  beforeEach(() => {
    ; (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() })
      ; (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '1' })

    useCartStore.setState({
      lists: [
        {
          id: 'list-1',
          name: 'Lista 1',
          products: [{ id: '1', item: 'Arroz', quantity: '2', price: '10', collected: false }],
        },
      ],
      activeListId: 'list-1',
      products: [{ id: '1', item: 'Arroz', quantity: '2', price: '10', collected: false }],
    })
  })

  it('Form deve renderizar com campos principais', () => {
    const { getByPlaceholderText, getByText } = render(
      <Form buttonTitle="Adicionar Item">
        <Text>+</Text>
      </Form>,
    )

    expect(getByPlaceholderText('Item')).toBeTruthy()
    expect(getByPlaceholderText('1')).toBeTruthy()
    expect(getByPlaceholderText('1,39')).toBeTruthy()
    expect(getByText('Adicionar Item')).toBeTruthy()
  })

  it('Add route deve renderizar', () => {
    const { toJSON } = render(<Add />)
    expect(toJSON()).toBeTruthy()
  })

  it('Edit route deve renderizar', () => {
    const { toJSON } = render(<Edit />)
    expect(toJSON()).toBeTruthy()
  })

  it('Home route deve renderizar', () => {
    const { toJSON } = render(<Home />)
    expect(toJSON()).toBeTruthy()
  })
})
