import { trpc } from "@/lib/trpc";
import StorefrontLayout from "@/components/StorefrontLayout";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { CustomerAuthModal } from "@/components/CustomerAuthModal";

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    shippingName: "",
    shippingEmail: user?.email || "",
    shippingPhone: "",
    shippingAddress: "",
    shippingCity: "",
    shippingState: "",
    shippingZipCode: "",
  });

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      clearCart();
      setLocation(`/order-confirmed?order=${data.orderNumber}`);
    },
    onError: (err) => toast.error(err.message),
  });

  if (items.length === 0) {
    return (
      <StorefrontLayout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-black mb-4">Your cart is empty</h1>
          <Button onClick={() => setLocation("/shop")} className="genz-gradient-bg text-primary-foreground border-0 rounded-full font-bold hover:opacity-90">Start Shopping</Button>
        </div>
      </StorefrontLayout>
    );
  }

  const [authModalOpen, setAuthModalOpen] = useState(false);

  if (!user) {
    return (
      <StorefrontLayout>
        <div className="container py-16 text-center">
          <div className="w-16 h-16 rounded-2xl genz-gradient-bg flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-black mb-2">Login Required</h1>
          <p className="text-muted-foreground mb-6 text-sm">Please sign in to complete your order.</p>
          <Button onClick={() => setAuthModalOpen(true)} className="gap-2 genz-gradient-bg text-primary-foreground border-0 rounded-full font-bold hover:opacity-90 px-8">
            <Shield className="w-4 h-4" /> Sign In to Continue
          </Button>
          <CustomerAuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
        </div>
      </StorefrontLayout>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orderItems = items.map(item => ({
      productId: item.productId,
      size: item.size as "XS" | "S" | "M" | "L" | "XL" | "XXL",
      quantity: item.quantity,
    }));

    createOrderMutation.mutate({
      items: orderItems,
      ...formData,
    });
  };

  const shippingCost = totalPrice >= 999 ? 0 : 99;
  const finalTotal = totalPrice + shippingCost;

  return (
    <StorefrontLayout>
      <div className="container py-8">
        <button
          onClick={() => setLocation("/cart")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </button>

        <h1 className="text-3xl font-black tracking-tight mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border/50 rounded-2xl p-6 bg-card"
            >
              <h2 className="text-lg font-black mb-4">Shipping Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-wider">Full Name *</Label>
                  <Input
                    value={formData.shippingName}
                    onChange={e => setFormData(p => ({ ...p, shippingName: e.target.value }))}
                    placeholder="John Doe"
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-wider">Email *</Label>
                  <Input
                    type="email"
                    value={formData.shippingEmail}
                    onChange={e => setFormData(p => ({ ...p, shippingEmail: e.target.value }))}
                    placeholder="john@example.com"
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-wider">Phone *</Label>
                  <Input
                    value={formData.shippingPhone}
                    onChange={e => setFormData(p => ({ ...p, shippingPhone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-wider">Address *</Label>
                  <Input
                    value={formData.shippingAddress}
                    onChange={e => setFormData(p => ({ ...p, shippingAddress: e.target.value }))}
                    placeholder="123 Street Name, Locality"
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-wider">City *</Label>
                  <Input
                    value={formData.shippingCity}
                    onChange={e => setFormData(p => ({ ...p, shippingCity: e.target.value }))}
                    placeholder="Mumbai"
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase tracking-wider">State *</Label>
                    <Input
                      value={formData.shippingState}
                      onChange={e => setFormData(p => ({ ...p, shippingState: e.target.value }))}
                      placeholder="Maharashtra"
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase tracking-wider">ZIP Code *</Label>
                    <Input
                      value={formData.shippingZipCode}
                      onChange={e => setFormData(p => ({ ...p, shippingZipCode: e.target.value }))}
                      placeholder="400001"
                      required
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            <Button
              type="submit"
              className="w-full py-6 text-sm font-bold tracking-widest uppercase genz-gradient-bg text-primary-foreground border-0 rounded-xl hover:opacity-90 shadow-lg"
              size="lg"
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? "Placing Order..." : "Place Order"}
            </Button>
          </form>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="genz-glass rounded-2xl p-6 h-fit sticky top-24"
          >
            <h2 className="text-lg font-black mb-4 flex items-center gap-2">
              Order Summary
            </h2>
            <div className="space-y-3 mb-4">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {item.name[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Size {item.size} · Qty {item.quantity}</p>
                  </div>
                  <p className="font-bold text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-border/50 pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">{shippingCost === 0 ? "FREE" : `₹${shippingCost}`}</span>
              </div>
              <div className="border-t border-border/50 pt-2 flex justify-between font-black">
                <span>Total</span>
                <span className="genz-gradient-text text-lg">₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
