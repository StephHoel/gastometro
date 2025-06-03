import { ProductProps } from '@/interfaces/ProductProps'
import { SortProductsAlphabetically } from '@/utils/functions/SortList'

export function add(products: ProductProps[], newProduct: ProductProps) {
  return SortProductsAlphabetically.call([...products, { ...newProduct }])
}

export function replace(products: ProductProps[]) {
  return SortProductsAlphabetically.call(products)
}

export function remove(products: ProductProps[], productRemovedId: string) {
  return products.filter((product) => product.id !== productRemovedId)
}

export function edit(products: ProductProps[], editProduct: ProductProps) {
  const productsList = products.map((product) => {
    if (product.id === editProduct.id) return { ...product, ...editProduct }

    return product
  })

  return productsList
}

export function get(
  products: ProductProps[],
  productId: string,
): ProductProps | undefined {
  const newProducts = products.find((item) => item.id === productId)
  return newProducts
}
