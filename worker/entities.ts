import { IndexedEntity } from "./core-utils";
import type { Product, Cart, CartItem, User, Order, OrderItem } from "@shared/types";
import { MOCK_PRODUCTS } from "@shared/mock-data";
// MOCK USERS
export const MOCK_USERS: User[] = [
  { id: "user_1", email: "test@example.com", name: "Test User" },
  { id: "user_2", email: "aurelia@cloudflare.com", name: "Aurelia" },
  { id: "user_3", email: "dev@shop.com", name: "Dev" },
];
// USER ENTITY
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", email: "", name: "" };
  static seedData = MOCK_USERS;
  // NOTE: Removed custom keyOf to use default state.id, fixing the type error.
  // Login logic will now list users and filter by email.
}
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
  static readonly initialState: Cart = { id: "", userId: undefined, items: [] };
  async updateItemQuantity(productId: string, quantity: number): Promise<Cart> {
    return this.mutate(cart => {
      const itemIndex = cart.items.findIndex(i => i.productId === productId);
      if (quantity <= 0) {
        if (itemIndex > -1) cart.items.splice(itemIndex, 1);
      } else {
        if (itemIndex > -1) {
          cart.items[itemIndex].quantity = quantity;
        } else {
          cart.items.push({ productId, quantity });
        }
      }
      return cart;
    });
  }
  async mergeItems(itemsToMerge: CartItem[], userId?: string): Promise<Cart> {
    return this.mutate(cart => {
      if (userId) cart.userId = userId;
      itemsToMerge.forEach(newItem => {
        const existingItem = cart.items.find(item => item.productId === newItem.productId);
        if (existingItem) {
          existingItem.quantity += newItem.quantity;
        } else {
          cart.items.push(newItem);
        }
      });
      return cart;
    });
  }
}
// ORDER ENTITY
export class OrderEntity extends IndexedEntity<Order> {
  static readonly entityName = "order";
  static readonly indexName = "orders";
  static readonly initialState: Order = {
    id: "",
    userId: "",
    items: [],
    total: 0,
    timestamp: "",
  };
}