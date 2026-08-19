import { useState } from "react";
import { trpc } from "@/lib/trpc";
import StorefrontLayout from "@/components/StorefrontLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Package, User, ShoppingBag } from "lucide-react";
import { CustomerAuthModal } from "@/components/CustomerAuthModal";



const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  shipped: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  delivered: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
};

export default function Account() {
  const { user, loading } = useAuth();
  const { data: orders, isLoading: ordersLoading } = trpc.orders.myOrders.useQuery(
    undefined,
    { enabled: !!user }
  );
  const [authModalOpen, setAuthModalOpen] = useState(false);

  if (loading) {
    return (
      <StorefrontLayout>
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded-2xl" />
            <div className="h-24 bg-muted rounded-xl" />
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  if (!user) {
    return (
      <StorefrontLayout>
        <div className="container py-16 text-center">
          <div className="w-16 h-16 rounded-2xl genz-gradient-bg flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-black mb-2">Sign In Required</h1>
          <p className="text-muted-foreground mb-6 text-sm">Login to view your orders</p>
          <Button onClick={() => setAuthModalOpen(true)} className="genz-gradient-bg text-primary-foreground border-0 rounded-full font-bold px-8 hover:opacity-90">
            Sign In
          </Button>
          <CustomerAuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout>
      <div className="container py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="genz-glass rounded-2xl p-6 mb-8 relative overflow-hidden"
        >
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl genz-gradient-bg flex items-center justify-center text-primary-foreground text-xl font-black shadow-lg">
              {user.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <h1 className="text-xl font-black">{user.name || "User"}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </motion.div>

        <h2 className="text-2xl font-black tracking-tight mb-6">My Orders</h2>

        {ordersLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : orders?.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground mb-2">No orders yet</p>
            <p className="text-sm text-muted-foreground">Time to treat yourself!</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders?.map((order: any, i: number) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border border-border/50 rounded-xl p-5 bg-card genz-card-hover"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-black">{order.orderNumber}</span>
                      <Badge variant="outline" className={`border rounded-full text-xs capitalize ${STATUS_COLORS[order.status] || ""}`}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <p className="font-black genz-gradient-text text-lg">₹{order.totalAmount.toLocaleString()}</p>
                </div>
                <div className="border-t border-border/50 pt-3">
                  {order.items?.map((item: any, j: number) => (
                    <p key={j} className="text-sm text-muted-foreground">
                      {item.productName} · Size {item.size} · Qty {item.quantity}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
}
