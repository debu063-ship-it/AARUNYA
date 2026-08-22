import StorefrontLayout from "@/components/StorefrontLayout";
import { useCart } from "@/contexts/CartContext";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <StorefrontLayout>
        <div className="container py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h1 className="text-2xl font-black mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6 text-sm">Looks like you haven't added anything yet.</p>
            <Link href="/shop">
              <Button className="gap-2 genz-gradient-bg text-primary-foreground border-0 rounded-full px-8 font-bold hover:opacity-90">
                Start Shopping <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </StorefrontLayout>
    );
  }

  const shippingCost = totalPrice >= 999 ? 0 : 59;
  const finalTotal = totalPrice + shippingCost;

  return (
    <StorefrontLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-black tracking-tight mb-8">Your Cart ({totalItems})</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={`${item.productId}-${item.size}-${item.color || 'default'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border border-border/50 rounded-xl p-4 flex gap-4 bg-card genz-card-hover"
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xl font-black text-muted-foreground/30">{item.name[0]}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${encodeURIComponent(item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}`}>
                    <h3 className="font-bold truncate hover:text-primary transition-colors">{item.name}</h3>
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                    <span>Size: <strong className="text-foreground">{item.size}</strong></span>
                    {item.color && (
                      <>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1.5">
                          {item.colorHex && (
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/20"
                              style={{ backgroundColor: item.colorHex }}
                            />
                          )}
                          <span>Colour: <strong className="text-foreground">{item.color}</strong></span>
                        </span>
                      </>
                    )}
                  </div>
                  <p className="font-bold mt-1 genz-gradient-text">₹{item.price.toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-0 border border-border/50 rounded-full overflow-hidden">
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1, item.color)}
                      className="p-2 hover:bg-accent transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </motion.button>
                    <span className="px-3 text-sm font-bold">{item.quantity}</span>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1, item.color)}
                      className="p-2 hover:bg-accent transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </motion.button>
                  </div>
                  <p className="font-bold">₹{(item.price * item.quantity).toLocaleString()}</p>
                  <button
                    onClick={() => removeItem(item.productId, item.size, item.color)}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="border border-border/50 rounded-2xl p-6 bg-card h-fit sticky top-24"
          >
            <h2 className="text-lg font-black mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">{shippingCost === 0 ? "FREE" : `₹${shippingCost}`}</span>
              </div>
              {shippingCost > 0 && (
                <p className="text-xs text-muted-foreground">
                  Add ₹{(999 - totalPrice).toLocaleString()} more for free shipping
                </p>
              )}
              <div className="border-t border-border/50 pt-3 flex justify-between font-black text-base">
                <span>Total</span>
                <span className="genz-gradient-text">₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>
            <Link href="/checkout">
              <Button className="w-full mt-4 py-6 text-sm font-bold tracking-widest uppercase gap-2 genz-gradient-bg text-primary-foreground border-0 rounded-xl hover:opacity-90 shadow-lg">
                Checkout <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/shop">
              <Button variant="ghost" className="w-full mt-2 text-sm rounded-xl">
                Continue Shopping
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
