import { DuplicateProducts } from '@/utils/functions/DuplicateProducts'

describe('DuplicateProducts', () => {
  it('deve agrupar duplicados por nome e preço normalizados', () => {
    const products = [
      { id: '1', item: ' Arroz  Branco ', quantity: '1', price: '10', collected: false },
      { id: '2', item: 'arroz branco', quantity: '2', price: '10,00', collected: true },
      { id: '3', item: 'Arroz Branco', quantity: '1', price: '11', collected: false },
      { id: '4', item: 'Feijão', quantity: '1', price: '8', collected: false },
      { id: '5', item: '  FEIJÃO ', quantity: '1', price: '8,0', collected: false },
    ]

    const groups = DuplicateProducts.getGroups(products)

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

    expect(DuplicateProducts.getGroups(products)).toEqual([])
  })

  it('deve forçar collected para false quando a quantidade final mudar', () => {
    const groups = DuplicateProducts.getGroups([
      { id: '1', item: 'Arroz', quantity: '2', price: '10', collected: true },
      { id: '2', item: ' arroz ', quantity: '2', price: '10,00', collected: false },
    ])

    const result = DuplicateProducts.mergeGroup(groups[0], '1')

    expect(result).toEqual({
      mergedProduct: {
        id: '1',
        item: 'Arroz',
        quantity: '4',
        price: '10',
        collected: false,
      },
      removedIds: ['2'],
    })
  })

  it('deve manter collected quando a quantidade final não mudar', () => {
    const groups = DuplicateProducts.getGroups([
      { id: '1', item: 'Feijão', quantity: '1', price: '8', collected: true },
      { id: '2', item: ' feijão ', quantity: '0', price: '8,0', collected: false },
    ])

    const result = DuplicateProducts.mergeGroup(groups[0], '1')

    expect(result).toEqual({
      mergedProduct: {
        id: '1',
        item: 'Feijão',
        quantity: '1',
        price: '8',
        collected: true,
      },
      removedIds: ['2'],
    })
  })

  it('deve forçar collected para false quando a quantidade final mudar com quantidades diferentes', () => {
    const groups = DuplicateProducts.getGroups([
      { id: '1', item: 'Feijão', quantity: '1', price: '8', collected: true },
      { id: '2', item: ' feijão ', quantity: '3', price: '8,0', collected: true },
    ])

    const result = DuplicateProducts.mergeGroup(groups[0], '1')

    expect(result).toEqual({
      mergedProduct: {
        id: '1',
        item: 'Feijão',
        quantity: '4',
        price: '8',
        collected: false,
      },
      removedIds: ['2'],
    })
  })

  it('deve retornar undefined quando o grupo tiver menos de dois itens', () => {
    const groups = DuplicateProducts.getGroups([
      { id: '1', item: 'Arroz', quantity: '1', price: '10', collected: false },
    ])

    expect(groups).toEqual([])

    const result = DuplicateProducts.mergeGroup(
      {
        keyItem: 'arroz',
        keyPrice: '10',
        products: [{ id: '1', item: 'Arroz', quantity: '1', price: '10', collected: false }],
      },
      '1',
    )

    expect(result).toBeUndefined()
  })

  it('deve retornar undefined quando os preços do grupo não forem consistentes com a chave', () => {
    const result = DuplicateProducts.mergeGroup({
      keyItem: 'arroz',
      keyPrice: '10',
      products: [
        { id: '1', item: 'Arroz', quantity: '1', price: '10', collected: false },
        { id: '2', item: 'Arroz', quantity: '2', price: '12', collected: false },
      ],
    })

    expect(result).toBeUndefined()
  })

  it('deve retornar undefined quando keepProductId não existir no grupo', () => {
    const groups = DuplicateProducts.getGroups([
      { id: '1', item: 'Arroz', quantity: '1', price: '10', collected: false },
      { id: '2', item: ' arroz ', quantity: '2', price: '10,00', collected: false },
    ])

    const result = DuplicateProducts.mergeGroup(groups[0], 'nao-existe')

    expect(result).toBeUndefined()
  })

  it('deve manter o primeiro item quando keepProductId não for informado', () => {
    const groups = DuplicateProducts.getGroups([
      { id: '1', item: 'Arroz', quantity: '1', price: '10', collected: true },
      { id: '2', item: ' arroz ', quantity: '0', price: '10,00', collected: false },
    ])

    const result = DuplicateProducts.mergeGroup(groups[0])

    expect(result).toEqual({
      mergedProduct: {
        id: '1',
        item: 'Arroz',
        quantity: '1',
        price: '10',
        collected: true,
      },
      removedIds: ['2'],
    })
  })
})
