import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Home, ShoppingBag, User as UserIcon } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api-client";
import type { Order } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ThemeToggle";
export function AccountPage() {
  const { user, isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: () => api<{ items: Order[] }>(`/api/orders/${user!.id}`),
    enabled: !!user,
  });
  if (!user) {
    return null; // or a loading spinner, though the effect should redirect
  }
  return (
    <div className="bg-background text-foreground min-h-screen">
      <ThemeToggle className="fixed top-4 right-4 z-50" />
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold font-display">Aurelia</h1>
          </Link>
          <Button asChild variant="outline">
            <Link to="/"><Home className="mr-2 h-4 w-4" /> Back to Shop</Link>
          </Button>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex flex-col sm:flex-row items-start gap-8">
              <Card className="w-full sm:w-64 text-center p-6 flex-shrink-0">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={`https://api.dicebear.com/8.x/lorelei/svg?seed=${user.email}`} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-semibold">{user.name}</h2>
                <p className="text-muted-foreground">{user.email}</p>
              </Card>
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : ordersData && ordersData.items.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                      {ordersData.items.map((order) => (
                        <AccordionItem value={order.id} key={order.id}>
                          <AccordionTrigger>
                            <div className="flex justify-between w-full pr-4">
                              <span>Order #{order.id.slice(-6).toUpperCase()}</span>
                              <span className="text-muted-foreground">{new Date(order.timestamp).toLocaleDateString()}</span>
                              <span className="font-semibold">${order.total.toFixed(2)}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pt-2">
                              {order.items.map((item) => (
                                <div key={item.productId} className="flex items-center gap-4">
                                  <img src={item.imageUrl} alt={item.title} className="w-16 h-16 object-cover rounded-md" />
                                  <div className="flex-1">
                                    <p className="font-medium">{item.title}</p>
                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                  </div>
                                  <p className="text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                              ))}
                              <Separator />
                              <div className="flex justify-end font-bold">
                                <p>Total: ${order.total.toFixed(2)}</p>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <div className="text-center py-12">
                      <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-2 text-lg font-medium">No orders yet</h3>
                      <p className="mt-1 text-sm text-muted-foreground">You haven't placed any orders with us.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </main>
      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
          <p>Built with ❤️ at Cloudflare</p>
        </div>
      </footer>
    </div>
  );
}