import { trpc } from "@/lib/trpc";
import StorefrontLayout from "@/components/StorefrontLayout";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/_core/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Sparkles, CreditCard, Loader2, Truck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { CustomerAuthModal } from "@/components/CustomerAuthModal";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

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

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [paymentState, setPaymentState] = useState<"idle" | "creating" | "paying" | "verifying">("idle");

  const createOrderMutation = trpc.orders.create.useMutation();
  const verifyPaymentMutation = trpc.orders.verifyPayment.useMutation();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentState("creating");

    try {
      // Step 1: Create order and get Razorpay order details
      const orderItems = items.map(item => ({
        productId: item.productId,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
      }));

      const orderData = await createOrderMutation.mutateAsync({
        items: orderItems,
        ...formData,
      });

      // Step 2: Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Failed to load payment gateway. Please check your internet connection.");
        setPaymentState("idle");
        return;
      }

      setPaymentState("paying");

      // Step 3: Open Razorpay checkout
      const options = {
        key: orderData.razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Aarunya",
        description: `Order #${orderData.orderNumber}`,
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: formData.shippingName,
          email: formData.shippingEmail,
          contact: formData.shippingPhone,
        },
        theme: {
          color: "#7c3aed",
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          // Step 4: Verify payment on server
          setPaymentState("verifying");
          try {
            const result = await verifyPaymentMutation.mutateAsync({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            clearCart();
            setLocation(`/order-confirmed?order=${result.orderNumber}`);
          } catch (err: any) {
            toast.error(err.message || "Payment verification failed. Contact support if money was deducted.");
            setPaymentState("idle");
          }
        },
        modal: {
          ondismiss: () => {
            toast.error("Payment was cancelled. You can try again.");
            setPaymentState("idle");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response: any) => {
        toast.error(response.error?.description || "Payment failed. Please try again.");
        setPaymentState("idle");
      });
      razorpay.open();
    } catch (err: any) {
      toast.error(err.message || "Failed to create order. Please try again.");
      setPaymentState("idle");
    }
  };

  const shippingCost = totalPrice >= 999 ? 0 : 59;
  const finalTotal = totalPrice + shippingCost;

  const isProcessing = paymentState !== "idle";
  const buttonLabel = {
    idle: `Pay ₹${finalTotal.toLocaleString()}`,
    creating: "Creating Order...",
    paying: "Complete Payment...",
    verifying: "Verifying Payment...",
  }[paymentState];

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

            {/* Payment info card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="border border-border/50 rounded-2xl p-6 bg-card"
            >
              <h2 className="text-lg font-black mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5" /> Payment
              </h2>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                <div className="w-10 h-10 rounded-xl bg-[#072654] flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 250 80" className="w-7 h-7" fill="white">
                    <path d="M178.98 16.9h-23.88l-14.94 47.09h23.89L178.98 16.9zM125.6 16.9L101.72 45.8l-2.58-24.77c-.3-2.95-2.8-4.13-5.28-4.13H62.53l-.54 2.13c4.48 1.07 9.58 2.93 12.67 4.87 1.88 1.17 2.42 2.2 3.04 4.97l18.2 55.03h24.13L149.72 16.9h-24.12zM231.53 63.99h21.13l-18.43-47.09h-19.49c-2.39 0-4.4 1.39-5.29 3.53l-34.31 43.56h24.02l4.77-13.17h29.33l2.27 13.17zM215.03 38.26l12.04 27.52h-19.02l6.98-27.52z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold">Secure Payment via Razorpay</p>
                  <p className="text-xs text-muted-foreground">UPI, Cards, Net Banking, Wallets & more</p>
                </div>
              </div>
            </motion.div>

            <Button
              type="submit"
              className="w-full py-6 text-sm font-bold tracking-widest uppercase genz-gradient-bg text-primary-foreground border-0 rounded-xl hover:opacity-90 shadow-lg gap-2"
              size="lg"
              disabled={isProcessing}
            >
              {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
              {buttonLabel}
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
                    <p className="text-xs text-muted-foreground">
                      {item.color ? `${item.color} · ` : ""}Size {item.size} · Qty {item.quantity}
                    </p>
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

            <div className="mt-4 p-3.5 rounded-xl bg-muted/40 border border-border/50 text-xs space-y-1.5 text-muted-foreground">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Truck className="w-3.5 h-3.5 text-primary" />
                <span>Delhivery Express Logistics</span>
              </div>
              <p>
                All orders are packaged securely and dispatched with real-time Delhivery tracking.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
