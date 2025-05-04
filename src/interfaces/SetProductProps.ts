export interface SetProductProps {
  id: string; // Unique identifier for the product
  item: string; // Name of the product
  qtt: string; // Quantity of the product
  price: string; // Price of the product
  collected?: boolean; // Optional flag indicating if the product has been collected
}