import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import type { CartItem, Product } from "@shared/types";
interface CartSheetProps {
  children: React.ReactNode;
  items: (CartItem & { product?: Product })[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}
export function CartSheet({ children, items, onUpdateQuantity, onRemoveItem, onCheckout }: CartSheetProps) {
  const subtotal = items.reduce((acc, item) => acc + (item.product?.price ?? 0) * item.quantity, 0);
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>
        <Separator />
        {items.length > 0 ? (
          <>
            <div className="flex-1 overflow-y-auto -mx-6 px-6">
              <div className="divide-y">
                {items.map((item) => item.product && (
                  <div key={item.productId} className="flex items-center py-4">
                    <img src={item.product.imageUrl} alt={item.product.title} className="w-20 h-20 object-cover rounded-md mr-4" loading="lazy" />
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.product.title}</h4>
                      <p className="text-sm text-muted-foreground">${item.product.price.toFixed(2)}</p>
                      <div className="flex items-center mt-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-10 text-center">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.productId)}>
                      <Trash2 className="h-5 w-5 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
            <SheetFooter className="mt-auto">
              <div className="w-full space-y-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <Button className="w-full" size="lg" onClick={onCheckout}>
                  Proceed to Checkout
                </Button>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">Your cart is empty</h3>
            <p className="text-muted-foreground">Add some products to get started.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}