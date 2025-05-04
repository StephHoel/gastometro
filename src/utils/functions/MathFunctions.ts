import type { ProductProps } from "@/interfaces/ProductProps";
import type { StateProps } from "@/interfaces/StateProps";

function ParseToFloat(value: string): number {
  return Number.parseFloat(value)
}

export function Multiply(value1: string, value2: string): number {
  return ParseToFloat(value1) * ParseToFloat(value2)
}

export function SetCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function ReduceProducts(cartStore: StateProps): number {
  return cartStore.products.reduce(
    (acc: number, currentItem: ProductProps) =>
      acc + Multiply(currentItem.quantity, currentItem.price),
    0
  );
}