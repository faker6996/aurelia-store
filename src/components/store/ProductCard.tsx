import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, ShoppingCart, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@shared/types";
interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}
export function ProductCard({ product, onQuickView, onAddToCart }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative group"
    >
      <Card className="overflow-hidden transition-all duration-300 group-hover:shadow-xl">
        <CardContent className="p-0">
          <div className="relative">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-auto object-cover aspect-[4/3] transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
              <Button size="icon" variant="secondary" className="rounded-full" onClick={() => onQuickView(product)}>
                <Eye className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="secondary" className="rounded-full" onClick={() => onAddToCart(product)}>
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </div>
            {product.inventory < 10 && (
              <Badge variant="destructive" className="absolute top-3 right-3">
                Low Stock
              </Badge>
            )}
          </div>
          <div className="p-4 space-y-2">
            <h3 className="text-lg font-semibold truncate">{product.title}</h3>
            <p className="text-sm text-muted-foreground">{product.category}</p>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-foreground">${product.price.toFixed(2)}</p>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm text-muted-foreground">4.5</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button className="w-full" onClick={() => onAddToCart(product)}>
            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="w-full aspect-[4/3]" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-5 w-1/4" />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}