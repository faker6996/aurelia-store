import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "react-use";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster, toast } from "sonner";
import { Filter, ShoppingCart, User as UserIcon, Search, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { api } from "@/lib/api-client";
import type { Product, Cart, User } from "@shared/types";
import { MOCK_BRANDS, MOCK_CATEGORIES } from "@shared/mock-data";
import { ProductGrid } from "@/components/store/ProductGrid";
import { FiltersSidebar, Filters } from "@/components/store/FiltersSidebar";
import { CartSheet } from "@/components/store/CartSheet";
import { LoginModal } from "@/components/auth/LoginModal";
import { useAuthStore } from "@/stores/authStore";
const MAX_PRICE = 500;
export function HomePage() {
  const isMobile = useIsMobile();
  const [filters, setFilters] = useState<Filters>({ categories: [], brands: [], priceRange: [0, MAX_PRICE] });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const { user, isLoggedIn, logout } = useAuthStore();
  const [localCartId, setLocalCartId] = useLocalStorage("cartId", crypto.randomUUID());
  const cartId = isLoggedIn ? user?.id : localCartId;
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.categories.length) params.append("category", filters.categories.join(","));
      if (filters.brands.length) params.append("brand", filters.brands.join(","));
      params.append("minPrice", String(filters.priceRange[0]));
      params.append("maxPrice", String(filters.priceRange[1]));
      return api<{ items: Product[]; next: string | null }>(`/api/products?${params.toString()}`);
    },
  });
  const { data: cart, refetch: refetchCart } = useQuery({
    queryKey: ["cart", cartId],
    queryFn: () => api<Cart>(`/api/cart/${cartId}`),
    enabled: !!cartId,
  });
  const allProducts = useMemo(() => productsData?.items ?? [], [productsData]);
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return allProducts;
    return allProducts.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [allProducts, searchQuery]);
  const cartItems = useMemo(() => cart?.items ?? [], [cart]);
  const productsById = useMemo(() => new Map(allProducts.map(p => [p.id, p])), [allProducts]);
  const cartItemsWithDetails = useMemo(() => {
    return cartItems.map(item => ({ ...item, product: productsById.get(item.productId) })).filter(item => !!item.product);
  }, [cartItems, productsById]);
  const totalCartItems = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);
  const handleUpdateCart = useCallback(async (productId: string, quantity: number) => {
    try {
      await api<Cart>('/api/cart', {
        method: 'POST',
        body: JSON.stringify({ cartId, productId, quantity, userId: user?.id }),
      });
      await refetchCart();
    } catch (error) {
      toast.error("Failed to update cart.");
    }
  }, [cartId, refetchCart, user?.id]);
  const handleAddToCart = (product: Product) => {
    const existingItem = cartItems.find(item => item.productId === product.id);
    const newQuantity = (existingItem?.quantity ?? 0) + 1;
    handleUpdateCart(product.id, newQuantity);
    toast.success(`${product.title} added to cart!`);
  };
  const handleRemoveFromCart = (productId: string) => {
    handleUpdateCart(productId, 0);
    toast.info("Item removed from cart.");
  };
  const handleLoginSuccess = async (loggedInUser: User) => {
    if (localCartId) {
      try {
        await api('/api/cart/merge', {
          method: 'POST',
          body: JSON.stringify({ localCartId, userId: loggedInUser.id }),
        });
        setLocalCartId(crypto.randomUUID()); // Reset local cart id
        await refetchCart();
      } catch (error) {
        toast.error("Could not merge your local cart.");
      }
    }
  };
  return (
    <div className="bg-background text-foreground min-h-screen">
      <ThemeToggle className="fixed top-4 right-4 z-50" />
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold font-display hidden sm:block">Aurelia</h1>
          </div>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CartSheet items={cartItemsWithDetails} onUpdateQuantity={handleUpdateCart} onRemoveItem={handleRemoveFromCart}>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-6 w-6" />
                {totalCartItems > 0 && <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center p-0">{totalCartItems}</Badge>}
              </Button>
            </CartSheet>
            {isLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://api.dicebear.com/8.x/lorelei/svg?seed=${user.email}`} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setLoginModalOpen(true)}>
                <UserIcon className="h-6 w-6" />
              </Button>
            )}
          </div>
        </div>
      </header>
      <main>
        <section className="relative bg-secondary overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/10"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center relative">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
              <h2 className="text-4xl md:text-6xl font-bold font-display tracking-tight text-pretty">Edge-First Ecommerce, Redefined.</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground text-pretty">Discover our curated collection of high-quality products, delivered with unparalleled speed and reliability.</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">Shop Now</Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {isMobile ? (
              <Sheet>
                <SheetTrigger asChild><Button variant="outline" className="mb-6 w-full"><Filter className="mr-2 h-4 w-4" />Filters</Button></SheetTrigger>
                <SheetContent side="left"><SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader><FiltersSidebar filters={filters} setFilters={setFilters} allCategories={MOCK_CATEGORIES} allBrands={MOCK_BRANDS} className="mt-4" /></SheetContent>
              </Sheet>
            ) : (
              <FiltersSidebar filters={filters} setFilters={setFilters} allCategories={MOCK_CATEGORIES} allBrands={MOCK_BRANDS} className="sticky top-24 h-fit col-span-1" />
            )}
            <div className="lg:col-span-3">
              <ProductGrid products={filteredProducts} isLoading={isLoadingProducts} onQuickView={setSelectedProduct} onAddToCart={handleAddToCart} />
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
          <p>Built with ❤️ at Cloudflare</p>
        </div>
      </footer>
      <AnimatePresence>
        {selectedProduct && (
          <Dialog open onOpenChange={() => setSelectedProduct(null)}>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader><DialogTitle>{selectedProduct.title}</DialogTitle></DialogHeader>
              <div className="grid md:grid-cols-2 gap-6 items-start">
                <img src={selectedProduct.imageUrl} alt={selectedProduct.title} className="w-full h-auto object-cover rounded-lg aspect-square" />
                <div className="space-y-4">
                  <p className="text-muted-foreground">{selectedProduct.description}</p>
                  <div className="flex items-baseline gap-2"><span className="text-3xl font-bold">${selectedProduct.price.toFixed(2)}</span></div>
                  <Separator />
                  <div className="text-sm">
                    <p><strong>Category:</strong> {selectedProduct.category}</p>
                    <p><strong>Brand:</strong> {selectedProduct.brand}</p>
                    <p><strong>In Stock:</strong> {selectedProduct.inventory} units</p>
                  </div>
                  <Button size="lg" className="w-full" onClick={() => { handleAddToCart(selectedProduct); setSelectedProduct(null); }}>
                    <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
      <LoginModal open={isLoginModalOpen} onOpenChange={setLoginModalOpen} onLoginSuccess={handleLoginSuccess} />
      <Toaster richColors closeButton />
    </div>
  );
}