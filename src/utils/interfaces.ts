import type { ParamListBase, RouteProp } from "@react-navigation/native"

export interface ProductProps {
  id: string
  quantity: string
  item: string
  price: string
  collected: boolean // Indica se o item foi coletado
}

export type StateProps = {
  products: ProductProps[]
  add: (product: ProductProps) => void
  edit: (product: ProductProps) => void
  replace: (products: ProductProps[]) => void
  remove: (productId: string) => void
  get: (productId: string) => ProductProps | undefined
  clear: () => void
}

export interface ButtonProps {
  text: string
  action: () => void
}

export interface SetProductProps {
  id: string
  item: string
  qtt: string
  price: string
  collected?: boolean
}

type RootStackParamList = ParamListBase & {
  Index: undefined;
  Add: undefined;
  Edit: { id: string };
};

export type CurrentRoute = RouteProp<RootStackParamList, keyof RootStackParamList>;


export type IconsProps = {
  size?: number
  color?: string
  checked?: boolean
}