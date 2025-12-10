export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface User {
  id: string;
  email: string;
  name: string;
}
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  brand: string;
  colors: string[];
  inventory: number;
}
export interface CartItem {
  productId: string;
  quantity: number;
}
export interface Cart {
  id:string;
  userId?: string;
  items: CartItem[];
}
export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  title: string;
  imageUrl: string;
}
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  timestamp: string;
}