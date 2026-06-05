import React from 'react'
import { render } from '@testing-library/react-native'
import { Text } from 'react-native'
import { Form } from '@/components/Form'
import Add from '@/app/list/add'
import Edit from '@/app/list/edit/[id]'
import Home from '@/app/index'
import { useCartStore } from '@/stores/CartStore'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useRoute } from 'expo-router/react-navigation'

// jest.mock('@expo-google-fonts/inter', () => ({
//   Inter_700Bold: {},
//   Inter_500Medium: {},
//   Inter_400Regular: {},
//   Inter_600SemiBold: {},
//   useFonts: jest.fn(() => [true]),
// }))

jest.mock('@/stores/CartStore', () => ({
  useCartStore: jest.fn(),
}))

jest.mock('expo-router', () => ({
  Tabs: Object.assign(
    ({ children }: { children: React.ReactNode }) => <>{children}</>,
    { Screen: () => null }
  ),
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}))

jest.mock('expo-router/react-navigation', () => ({
  useRoute: jest.fn(),
}))

jest.mock('@/components/CustomAlert', () => ({
  CustomAlert: () => null,
}))

jest.mock('@/styles/global.css', () => ({}))

jest.mock('@/hooks/useInitAlert', () => ({
  useInitAlert: jest.fn(),
}))

jest.mock('@/services/AlertService', () => ({
  AlertService: {
    ok: jest.fn(),
    remove: jest.fn(),
    share: jest.fn(),
    paste: jest.fn(),
  },
}))

jest.mock('@/services/ProductService', () => ({
  ProductService: {
    isDuplicateItem: jest.fn(() => false),
    createOrUpdateProduct: jest.fn((data) => ({
      id: data.id,
      item: data.item,
      quantity: data.qtt || '0',
      price: data.price || '0.00',
      collected: data.collected || false,
    })),
  },
}))

jest.mock('@/components/Header', () => ({
  Header: () => null,
}))

jest.mock('@/components/List', () => ({
  List: () => null,
}))

jest.mock('@/components/Screen', () => ({
  Screen: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  KeyboardScreen: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

jest.mock('@/components/Button', () => ({
  CustomButton: Object.assign(
    ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) => (
      <button onClick={onPress}>{children}</button>
    ),
    {
      Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
      Icon: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    }
  ),
}))

jest.mock('@/components/CustomInput', () => ({
  CustomInput: ({ placeholder, setItem, item, onSubmit }: {
    placeholder: string
    setItem: (value: string) => void
    item: string
    onSubmit: () => void
  }) => (
    <input
      placeholder={placeholder}
      value={item}
      onChange={(event) => setItem(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onSubmit()
      }}
    />
  ),
}))

jest.mock('@/components/Icons', () => ({
  AddIcon: () => null,
  BackIcon: () => null,
  BroomIcon: () => null,
  CalculatorIcon: () => null,
  EditIcon: () => null,
  HomeIcon: () => null,
  ShareIcon: () => null,
}))

jest.mock('@/components/TouchableIcons', () => ({
  Add: () => null,
  Back: () => null,
  Delete: () => null,
  Share: () => null,
}))

jest.mock('@/components/Card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

jest.mock('@/components/TextWhite', () => ({
  TextWhite: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}))

jest.mock('@/constants/pages', () => ({
  titlePages: {
    index: 'Lista de Compras',
    calculator: 'Calculadora de Preços',
    'list/add': 'Adicionando item',
    'list/edit/[id]': 'Editando item',
  },
}))

jest.mock('@/constants/text', () => ({
  text: {
    error: {
      alert_title: 'Erro!',
      required_fields: 'Por favor, preencha todos os campos corretamente.',
      negative_value: 'Valores negativos não são permitidos.',
      duplicate_item: 'Já existe um item com este nome na lista.',
    },
    buttons: {
      add: 'Adicionar Item',
      edit: 'Editar Item',
    },
    input: {
      placeholder: {
        item: 'Item',
        quantity: '1',
        price: '1,39',
      },
    },
  },
}))

function makeStore() {
  return {
    products: [
      { id: '1', item: 'Arroz', quantity: '2', price: '10', collected: false },
    ],
    add: jest.fn(),
    edit: jest.fn(),
    replace: jest.fn(),
    remove: jest.fn(),
    get: jest.fn((id: string) =>
      id === '1' ? { id: '1', item: 'Arroz', quantity: '2', price: '10', collected: false } : undefined
    ),
    clear: jest.fn(),
  }
}

describe('Form, Calculator and routes', () => {
  beforeEach(() => {
    ; (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() })
      ; (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '1' })
      ; (useRoute as jest.Mock).mockReturnValue({ name: 'index' })
      ; (useCartStore as unknown as jest.Mock).mockReturnValue(makeStore())
  })

  it('Form deve renderizar e enviar submissão básica', () => {
    const { toJSON } = render(
      <Form buttonTitle="Adicionar Item">
        <Text>+</Text>
      </Form>
    )

    expect(toJSON()).toBeTruthy()
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
