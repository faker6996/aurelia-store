import { Hono } from "hono";
import type { Env } from './core-utils';
import { ProductEntity, CartEntity, UserEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { Product, CartItem } from "@shared/types";
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
    const userEntity = new UserEntity(c.env, email);
    if (await userEntity.exists()) {
      const user = await userEntity.getState();
      return ok(c, user);
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
  // MOCK CHECKOUT
  app.post('/api/checkout', (c) => {
    return ok(c, { message: 'Checkout process initiated successfully.' });
  });
}