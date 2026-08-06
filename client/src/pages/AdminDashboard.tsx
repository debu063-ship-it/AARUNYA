import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { TrendingUp, ShoppingBag, Package, AlertTriangle } from "lucide-react";



const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  shipped: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  delivered: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
};

export default function AdminDashboard() {
  const { data: stats, isLoading } = trpc.adminDashboard.stats.useQuery(undefined, { staleTime: 5000 });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse h-8 w-64 bg-muted rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse h-28 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Revenue", value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, gradient: "from-green-500/10 to-emerald-500/5" },
    { label: "Total Orders", value: stats?.totalOrders || 0, icon: ShoppingBag, gradient: "from-blue-500/10 to-indigo-500/5" },
    { label: "Active Products", value: stats?.totalProducts || 0, icon: Package, gradient: "from-purple-500/10 to-pink-500/5" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-black tracking-tight mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-2xl p-5 bg-gradient-to-br ${card.gradient} border border-border/50 genz-card-hover`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl genz-gradient-bg flex items-center justify-center text-primary-foreground shadow-sm">
                <card.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{card.label}</p>
                <p className="text-2xl font-black">{card.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {stats?.lowStockProducts && stats.lowStockProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-lg font-black mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Low Stock Alert
          </h2>
          <div className="space-y-2">
            {stats.lowStockProducts.map((p: any) => (
              <div key={p.id} className="border border-border/50 rounded-xl p-3 flex items-center justify-between bg-card genz-card-hover">
                <span className="font-bold">{p.name}</span>
                <Badge variant="destructive" className="rounded-full genz-gradient-bg text-primary-foreground border-0">{p.stock} left</Badge>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {stats?.recentOrders && stats.recentOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-black mb-3">Recent Orders</h2>
          <div className="space-y-2">
            {stats.recentOrders.map((order: any) => (
              <div key={order.id} className="border border-border/50 rounded-xl p-4 flex items-center justify-between bg-card genz-card-hover">
                <div>
                  <span className="font-mono text-sm font-black">{order.orderNumber}</span>
                  <span className="ml-3 text-sm text-muted-foreground">{order.shippingName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black">₹{order.totalAmount.toLocaleString()}</span>
                  <Badge variant="outline" className={`rounded-full border capitalize ${STATUS_COLORS[order.status] || ""}`}>
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
