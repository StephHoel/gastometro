import { useCartStore } from "@/stores/CartStore";

export const CartStoreService = {
  getCartStore() { return useCartStore(); }
}