import { GetDuplicateProductsGroups } from '@/utils/functions/DuplicateProducts'

describe('DuplicateProducts', () => {
  it('deve agrupar duplicados por nome e preço normalizados', () => {
    const products = [
      { id: '1', item: ' Arroz  Branco ', quantity: '1', price: '10', collected: false },
      { id: '2', item: 'arroz branco', quantity: '2', price: '10,00', collected: true },
      { id: '3', item: 'Arroz Branco', quantity: '1', price: '11', collected: false },
      { id: '4', item: 'Feijão', quantity: '1', price: '8', collected: false },
      { id: '5', item: '  FEIJÃO ', quantity: '1', price: '8,0', collected: false },
    ]

    const groups = GetDuplicateProductsGroups(products)

    expect(groups).toHaveLength(2)

    const arroz = groups.find((g) => g.keyItem === 'arroz branco' && g.keyPrice === '10')
    expect(arroz?.products.map((p) => p.id)).toEqual(['1', '2'])

    const feijao = groups.find((g) => g.keyItem === 'feijão' && g.keyPrice === '8')
    expect(feijao?.products.map((p) => p.id)).toEqual(['4', '5'])
  })

  it('deve retornar vazio quando não houver duplicados', () => {
    const products = [
      { id: '1', item: 'Arroz', quantity: '1', price: '10', collected: false },
      { id: '2', item: 'Arroz', quantity: '1', price: '12', collected: false },
      { id: '3', item: 'Feijão', quantity: '1', price: '8', collected: false },
    ]

    expect(GetDuplicateProductsGroups(products)).toEqual([])
  })
})
