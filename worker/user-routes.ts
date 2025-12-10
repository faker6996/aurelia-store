import { Hono } from "hono";
import type { Env } from './core-utils';
import { ProductEntity, CartEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { Product } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Ensure products are seeded on first load
  app.use('/api/products*', async (c, next) => {
    await ProductEntity.ensureSeed(c.env);
    await next();
  });
  // GET /api/products - List products with filtering
  app.get('/api/products', async (c) => {
    const { cursor, limit, category, brand, minPrice, maxPrice } = c.req.query();
    // For this mock phase, we fetch all and filter in-memory.
    // A real implementation would use more advanced indexing in the DO.
    const { items: allProducts } = await ProductEntity.list(c.env, null, 1000); // Fetch all
    let filteredProducts: Product[] = allProducts;
    if (category) {
      const categories = category.split(',');
      filteredProducts = filteredProducts.filter(p => categories.includes(p.category));
    }
    if (brand) {
      const brands = brand.split(',');
      filteredProducts = filteredProducts.filter(p => brands.includes(p.brand));
    }
    if (minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= Number(maxPrice));
    }
    // Simple cursor/limit pagination on the filtered results
    const limitNum = limit ? parseInt(limit, 10) : 12;
    const cursorIndex = cursor ? filteredProducts.findIndex(p => p.id === cursor) + 1 : 0;
    const paginatedItems = filteredProducts.slice(cursorIndex, cursorIndex + limitNum);
    const nextCursor = paginatedItems.length === limitNum ? paginatedItems[paginatedItems.length - 1].id : null;
    return ok(c, { items: paginatedItems, next: nextCursor });
  });
  // GET /api/products/:id - Get a single product
  app.get('/api/products/:id', async (c) => {
    const { id } = c.req.param();
    const product = new ProductEntity(c.env, id);
    if (!(await product.exists())) {
      return notFound(c, 'Product not found');
    }
    return ok(c, await product.getState());
  });
  // GET /api/cart/:cartId - Get cart contents
  app.get('/api/cart/:cartId', async (c) => {
    const { cartId } = c.req.param();
    const cart = new CartEntity(c.env, cartId);
    if (!(await cart.exists())) {
      // Create a new cart if it doesn't exist
      const newCart = await CartEntity.create(c.env, { id: cartId, items: [] });
      return ok(c, newCart);
    }
    return ok(c, await cart.getState());
  });
  // POST /api/cart - Add/update item in cart
  app.post('/api/cart', async (c) => {
    const { cartId: reqCartId, productId, quantity } = await c.req.json<{ cartId?: string; productId: string; quantity: number }>();
    if (!isStr(productId) || typeof quantity !== 'number') {
      return bad(c, 'productId and quantity are required');
    }
    const cartId = reqCartId || crypto.randomUUID();
    const cart = new CartEntity(c.env, cartId);
    if (!(await cart.exists())) {
      await CartEntity.create(c.env, { id: cartId, items: [] });
    }
    const product = new ProductEntity(c.env, productId);
    if (!(await product.exists())) {
      return notFound(c, 'Product not found');
    }
    // In this phase, we just update quantity. A real app would check inventory.
    const updatedCart = await cart.updateItemQuantity(productId, quantity);
    return ok(c, updatedCart);
  });
  // POST /api/checkout - Mock checkout
  app.post('/api/checkout', (c) => {
    // In a real app, this would trigger a payment flow.
    // For now, it just returns a success message.
    return ok(c, { message: 'Checkout process initiated successfully.' });
  });
}