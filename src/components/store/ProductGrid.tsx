import { ProductCard, ProductCardSkeleton } from "./ProductCard";
import type { Product } from "@shared/types";
interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}
export function ProductGrid({ products, isLoading, onQuickView, onAddToCart }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      {isLoading
        ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
        : products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={onQuickView}
              onAddToCart={onAddToCart}
            />
          ))}
    </div>
  );
}