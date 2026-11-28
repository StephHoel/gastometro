import type { ProductProps } from '@/interfaces/ProductProps'
import type { ShoppingListProps } from '@/interfaces/ShoppingListProps'
import type { StateProps } from '@/interfaces/StateProps'

export function createMockStateProps(products: ProductProps[] = []): StateProps {
  const list: ShoppingListProps = {
    id: 'test-list-1',
    name: 'Test List',
    products,
  }
  
  return {
    lists: [list],
    activeListId: list.id,
    products,
    add: jest.fn(),
    edit: jest.fn(),
    replace: jest.fn(),
    remove: jest.fn(),
    get: jest.fn(),
    clear: jest.fn(),
    addList: jest.fn(),
    removeList: jest.fn(),
    renameList: jest.fn(),
    setActiveList: jest.fn(),
  }
}
