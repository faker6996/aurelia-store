# Aurelia Store

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/faker6996/aurelia-store)

## Overview

Aurelia Store is a visually stunning, performant edge-first e-commerce storefront built on Cloudflare Workers and Durable Objects. It features a polished interface with a hero section, product showcase grid, collapsible filter sidebar (desktop) and sheet (mobile), product cards with rich micro-interactions, and a cart sheet. The application is designed for rapid deployment and scalability, using shadcn/ui components and Tailwind CSS for a modern, responsive design.

This project establishes a production-grade foundation with mock data seeding for immediate interactivity, followed by backend integration for product and cart persistence.

### Key Features
- **Hero Section**: Engaging headline, subheadline, and primary CTA above the fold.
- **Product Grid**: Responsive showcase with hover effects, quick view modals, and add-to-cart functionality.
- **Filters**: Collapsible sidebar for categories, price sliders, brands, and colors; mobile-optimized sheet.
- **Product Details**: Quick view sheet with images, variants (color/size), pricing, and descriptions.
- **Cart Management**: Persistent cart sheet with item quantities, totals, and mock checkout flow.
- **Edge-Optimized**: All data operations via Cloudflare Workers and Durable Objects for low-latency performance.
- **Visual Excellence**: Gradient accents, glassmorphism cards, smooth animations (framer-motion), and skeleton loaders.
- **Responsive Design**: Mobile-first layout with flawless adaptation across devices.
- **Mock Backend**: Seeded product data for instant demo; extensible to real persistence.

Primary colors: #F38020 (warm accent), #1E3A8A (secondary indigo), #10B981 (success green).

## Technology Stack
- **Frontend**: React 18, React Router, TypeScript, shadcn/ui, Tailwind CSS 3, framer-motion (animations), @tanstack/react-query (data fetching/caching), Lucide React (icons), Sonner (toasts), Zustand (state management).
- **Backend**: Cloudflare Workers, Hono (routing), Durable Objects (via custom IndexedEntity library for entities like Products and Carts).
- **Utilities**: Zod (validation), React Hook Form (forms), React Use (hooks), Immer (immutable updates).
- **Build Tools**: Vite (bundler), Bun (package manager), Wrangler (Cloudflare CLI).
- **Storage**: Single Global Durable Object for multi-entity persistence (products, carts); no external databases required.

## Quick Start

### Prerequisites
- Bun 1.0+ installed (https://bun.sh/)
- Node.js 18+ (for some dev tools)
- Cloudflare account with Wrangler CLI installed (`bun add -g wrangler`)

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd aurelia-store
   ```

2. Install dependencies using Bun:
   ```
   bun install
   ```

3. (Optional) Generate TypeScript types for Cloudflare bindings:
   ```
   bun run cf-typegen
   ```

### Development
1. Start the development server:
   ```
   bun run dev
   ```
   The app will be available at `http://localhost:3000` (or the port specified in `$PORT`).

2. In a separate terminal, you can preview the built app:
   ```
   bun run preview
   ```

3. Lint the code:
   ```
   bun run lint
   ```

The development mode includes hot reloading for the frontend and serves API endpoints via the local Worker emulation.

### Usage Examples
- **Homepage**: Navigate to `/` to view the hero, product grid, and filters. Use the filter sidebar to refine products by category, price (via slider), brand, or color.
- **Product Quick View**: Click a product card to open a sheet with details, variant selectors, and add-to-cart button.
- **Cart**: Click the cart icon in the header to open the cart sheet. Add items from products; update quantities or remove items. Proceed to mock checkout.
- **API Interactions**: Frontend fetches products via `/api/products` and manages cart via `/api/cart`. Mock data is auto-seeded on first request.
- **Theme Toggle**: Use the sun/moon icon in the top-right for light/dark mode switching.

Example API call (from frontend via `api-client.ts`):
```tsx
import { api } from '@/lib/api-client';

// Fetch products
const products = await api<{ items: Product[]; next: string | null }>('/api/products?limit=12');

// Add to cart
await api('/api/cart', { method: 'POST', body: JSON.stringify({ productId: '123', quantity: 1 }) });
```

## Deployment
Deploy to Cloudflare Workers for edge deployment with global persistence via Durable Objects.

1. Authenticate with Cloudflare:
   ```
   wrangler login
   ```

2. Build the project:
   ```
   bun run build
   ```

3. Deploy:
   ```
   bun run deploy
   ```
   This bundles the frontend assets and deploys the Worker. The app will be live at your Worker URL (e.g., `https://aurelia-store.your-subdomain.workers.dev`).

4. For production:
   - Configure custom domains in the Cloudflare dashboard.
   - Set environment variables if needed (e.g., via Wrangler secrets: `wrangler secret put API_KEY`).
   - Monitor logs and metrics in the Cloudflare dashboard.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/faker6996/aurelia-store)

## Roadmap
- **Phase 1** (Current): Stunning frontend with mock backend for products and cart.
- **Phase 2**: Full Durable Object integration for server-persisted carts and authentication.
- **Phase 3**: Checkout flows, order history, account management, and performance optimizations.

## Contributing
Contributions are welcome! Fork the repo, create a feature branch, and submit a pull request. Ensure code follows TypeScript best practices, and run `bun run lint` before submitting.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.