export interface ProductProps {
  id: string; // Unique identifier for the product
  quantity: string; // Quantity of the product
  item: string; // Name of the product
  price: string; // Price of the product
  collected: boolean; // Indicates if the product has been collected
}