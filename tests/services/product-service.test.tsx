import { ProductService } from '@/services/ProductService'
import type { ProductProps } from '@/interfaces/ProductProps'

describe('ProductService', () => {
  it('createOrUpdateProduct deve normalizar nome, quantidade e preço', () => {
    const product = ProductService.createOrUpdateProduct({
      id: 'id-1',
      item: '  arROZ integral ',
      qtt: '',
      price: '',
      collected: undefined,
    })

    expect(product).toEqual({
      id: 'id-1',
      item: 'Arroz Integral',
      quantity: '0',
      price: '0.00',
      collected: false,
    })
  })

  it('createOrUpdateProduct deve bloquear negativos na normalização atual', () => {
    const product = ProductService.createOrUpdateProduct({
      id: 'id-2',
      item: 'banana',
      qtt: '-3',
      price: '-2,50',
      collected: false,
    })

    expect(product.quantity).toBe('0')
    expect(product.price).toBe('0.00')
  })

  it('isDuplicateItem deve considerar nome normalizado e ignorar id informado', () => {
    const products: ProductProps[] = [
      { id: '1', item: 'Arroz  Branco', quantity: '1', price: '10', collected: false },
      { id: '2', item: 'Feijão', quantity: '1', price: '8', collected: false },
      { id: '3', item: 'Arroz Branco', quantity: '2', price: '12', collected: false },
    ]

    expect(ProductService.isDuplicateItem(' arroz branco ', products)).toBe(true)
    expect(ProductService.isDuplicateItem(' arroz branco ', products, '1')).toBe(true)
    expect(ProductService.isDuplicateItem(' arroz branco ', products, '3')).toBe(true)
    expect(ProductService.isDuplicateItem('macarrão', products)).toBe(false)
  })
})
