import { motion } from "framer-motion";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";
import type { Product } from "@shared/types";
interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}
export function ProductGrid({ products, isLoading, onQuickView, onAddToCart }: ProductGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
      },
    },
  };
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
    >
      {isLoading
        ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
        : products.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard
                product={product}
                onQuickView={onQuickView}
                onAddToCart={onAddToCart}
              />
            </motion.div>
          ))}
    </motion.div>
  );
}