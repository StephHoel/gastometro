import type { ProductProps } from '@/interfaces/ProductProps'
import uuid from 'react-native-uuid'

export function ConvertToProductsList(clipboard: string) {
    if (!clipboard || typeof clipboard !== 'string') return []

    const lineListShop = GetListShop(clipboard)

    const listProducts: ProductProps[] = []

    lineListShop.forEach((line) => {
        const add = ExtractProductDetails(line)

        if (add != undefined)
            listProducts.push(add)
    })

    return listProducts
}

function GetListShop(clipboard: string): string[] {
    const listShops = clipboard.split('--')

    if (listShops.length <= 1)
        return []

    const listShop = listShops[1].trim()

    return listShop.split('|| ')
}

function ExtractProductDetails(line: string): ProductProps | undefined {
    const cols = line.split(' | ')

    if (cols.length <= 1) return undefined

    // 0 quantity item
    const quantityItem = cols[0].split('x ')
    const quantity = quantityItem[0].trim()
    const item = quantityItem[1].trim()

    // 1 price
    const price = cols[1].trim().slice(3)

    const add: ProductProps = {
        id: uuid.v4().toString(),
        item,
        quantity: quantity.replace(',', '.'),
        price: price.replace(',', '.'),
        collected: false
    }

    return add
}