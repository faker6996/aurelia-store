import { IndexedEntity } from "./core-utils";
import type { Product, Cart, CartItem } from "@shared/types";
import { MOCK_PRODUCTS } from "@shared/mock-data";
// PRODUCT ENTITY
export class ProductEntity extends IndexedEntity<Product> {
  static readonly entityName = "product";
  static readonly indexName = "products";
  static readonly initialState: Product = {
    id: "",
    title: "",
    description: "",
    price: 0,
    imageUrl: "",
    category: "",
    brand: "",
    colors: [],
    inventory: 0,
  };
  static seedData = MOCK_PRODUCTS;
}
// CART ENTITY
export class CartEntity extends IndexedEntity<Cart> {
  static readonly entityName = "cart";
  static readonly indexName = "carts";
  static readonly initialState: Cart = { id: "", items: [] };
  async addItem(productId: string, quantity: number): Promise<Cart> {
    return this.mutate(cart => {
      const existingItem = cart.items.find(item => item.productId === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
      // Ensure quantity is not negative
      if (existingItem && existingItem.quantity <= 0) {
        cart.items = cart.items.filter(item => item.productId !== productId);
      }
      return cart;
    });
  }
  async updateItemQuantity(productId: string, quantity: number): Promise<Cart> {
    return this.mutate(cart => {
      const item = cart.items.find(i => i.productId === productId);
      if (quantity <= 0) {
        cart.items = cart.items.filter(i => i.productId !== productId);
      } else if (item) {
        item.quantity = quantity;
      }
      return cart;
    });
  }
  async removeItem(productId: string): Promise<Cart> {
    return this.mutate(cart => {
      cart.items = cart.items.filter(item => item.productId !== productId);
      return cart;
    });
  }
  async getItems(): Promise<CartItem[]> {
    const { items } = await this.getState();
    return items;
  }
}