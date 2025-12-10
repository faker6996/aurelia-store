import { Hono } from "hono";
import type { Env } from './core-utils';
import { ProductEntity, CartEntity, UserEntity, OrderEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { Product, CartItem, OrderItem, Order } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Ensure products and users are seeded on first load
  app.use('/api/*', async (c, next) => {
    await ProductEntity.ensureSeed(c.env);
    await UserEntity.ensureSeed(c.env);
    await next();
  });
  // AUTH ROUTES
  app.post('/api/auth/login', async (c) => {
    const { email } = await c.req.json<{ email: string }>();
    if (!isStr(email)) return bad(c, 'Email is required');
    const { items: allUsers } = await UserEntity.list(c.env, null, 1000);
    const existingUser = allUsers.find(u => u.email === email);
    if (existingUser) {
      return ok(c, existingUser);
    }
    // For this mock, we'll create a user if they don't exist
    const name = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const newUser = { id: crypto.randomUUID(), email, name };
    await UserEntity.create(c.env, newUser);
    return ok(c, newUser);
  });
  // PRODUCT ROUTES
  app.get('/api/products', async (c) => {
    const { cursor, limit, category, brand, minPrice, maxPrice } = c.req.query();
    const { items: allProducts } = await ProductEntity.list(c.env, null, 1000);
    let filteredProducts: Product[] = allProducts;
    if (category) filteredProducts = filteredProducts.filter(p => category.split(',').includes(p.category));
    if (brand) filteredProducts = filteredProducts.filter(p => brand.split(',').includes(p.brand));
    if (minPrice) filteredProducts = filteredProducts.filter(p => p.price >= Number(minPrice));
    if (maxPrice) filteredProducts = filteredProducts.filter(p => p.price <= Number(maxPrice));
    const limitNum = limit ? parseInt(limit, 10) : 12;
    const cursorIndex = cursor ? filteredProducts.findIndex(p => p.id === cursor) + 1 : 0;
    const paginatedItems = filteredProducts.slice(cursorIndex, cursorIndex + limitNum);
    const nextCursor = paginatedItems.length === limitNum ? paginatedItems[paginatedItems.length - 1].id : null;
    return ok(c, { items: paginatedItems, next: nextCursor });
  });
  app.get('/api/products/:id', async (c) => {
    const { id } = c.req.param();
    const product = new ProductEntity(c.env, id);
    if (!(await product.exists())) return notFound(c, 'Product not found');
    return ok(c, await product.getState());
  });
  // CART ROUTES
  app.get('/api/cart/:cartId', async (c) => {
    const { cartId } = c.req.param();
    const cart = new CartEntity(c.env, cartId);
    if (!(await cart.exists())) {
      const newCart = await CartEntity.create(c.env, { id: cartId, items: [] });
      return ok(c, newCart);
    }
    return ok(c, await cart.getState());
  });
  app.post('/api/cart', async (c) => {
    const { cartId: reqCartId, productId, quantity, userId } = await c.req.json<{ cartId?: string; productId: string; quantity: number; userId?: string }>();
    if (!isStr(productId) || typeof quantity !== 'number') return bad(c, 'productId and quantity are required');
    const cartId = reqCartId || userId || crypto.randomUUID();
    const cart = new CartEntity(c.env, cartId);
    if (!(await cart.exists())) {
      await CartEntity.create(c.env, { id: cartId, items: [], userId });
    }
    if (userId) {
      await cart.mutate(c => ({...c, userId}));
    }
    const product = new ProductEntity(c.env, productId);
    if (!(await product.exists())) return notFound(c, 'Product not found');
    const updatedCart = await cart.updateItemQuantity(productId, quantity);
    return ok(c, updatedCart);
  });
  app.post('/api/cart/merge', async (c) => {
    const { localCartId, userId } = await c.req.json<{ localCartId: string; userId: string }>();
    if (!isStr(localCartId) || !isStr(userId)) return bad(c, 'localCartId and userId are required');
    const localCartEntity = new CartEntity(c.env, localCartId);
    const userCartEntity = new CartEntity(c.env, userId);
    if (!(await localCartEntity.exists())) return ok(c, await userCartEntity.getState());
    const localCart = await localCartEntity.getState();
    if (localCart.items.length === 0) return ok(c, await userCartEntity.getState());
    if (!(await userCartEntity.exists())) {
      await CartEntity.create(c.env, { id: userId, items: [], userId });
    }
    const mergedCart = await userCartEntity.mergeItems(localCart.items, userId);
    await localCartEntity.delete(); // Clear local cart after merging
    return ok(c, mergedCart);
  });
  // CHECKOUT & ORDER ROUTES
  app.post('/api/checkout', async (c) => {
    const { cartId, userId } = await c.req.json<{ cartId: string; userId: string }>();
    if (!isStr(cartId) || !isStr(userId)) return bad(c, 'cartId and userId are required');
    const cartEntity = new CartEntity(c.env, cartId);
    if (!(await cartEntity.exists())) return notFound(c, 'Cart not found');
    const cart = await cartEntity.getState();
    if (cart.items.length === 0) return bad(c, 'Cart is empty');
    const productIds = cart.items.map(item => item.productId);
    const productEntities = await Promise.all(productIds.map(id => new ProductEntity(c.env, id).getState()));
    const productsById = new Map(productEntities.map(p => [p.id, p]));
    let total = 0;
    const orderItems: OrderItem[] = [];
    for (const item of cart.items) {
      const product = productsById.get(item.productId);
      if (!product) return notFound(c, `Product with id ${item.productId} not found`);
      total += product.price * item.quantity;
      orderItems.push({ ...item, price: product.price, title: product.title, imageUrl: product.imageUrl });
    }
    const orderId = crypto.randomUUID();
    const order: Order = {
      id: orderId,
      userId,
      items: orderItems,
      total,
      timestamp: new Date().toISOString(),
    };
    await OrderEntity.create(c.env, order);
    await cartEntity.mutate(c => ({ ...c, items: [] })); // Clear cart
    return ok(c, { orderId, total });
  });
  app.get('/api/orders/:userId', async (c) => {
    const { userId } = c.req.param();
    if (!isStr(userId)) return bad(c, 'userId is required');
    const { items: allOrders } = await OrderEntity.list(c.env, null, 1000);
    const userOrders = allOrders
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return ok(c, { items: userOrders, next: null });
  });
}