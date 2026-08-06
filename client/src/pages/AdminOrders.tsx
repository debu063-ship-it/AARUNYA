import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";



const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  shipped: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  delivered: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
};

export default function AdminOrders() {
  const { data: orders, isLoading } = trpc.adminOrders.list.useQuery(undefined, { staleTime: 5000 });
  const utils = trpc.useUtils();

  const updateStatusMutation = trpc.adminOrders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Order status updated");
      utils.adminOrders.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return <div className="p-6"><div className="animate-pulse h-8 w-48 bg-muted rounded-xl mb-6" /></div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-black tracking-tight mb-6">Orders</h1>

      {orders?.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No orders yet</p>
        </div>
      )}

      <div className="space-y-3">
        {orders?.map((order: any, i: number) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="border border-border/50 rounded-xl p-4 bg-card genz-card-hover"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-black">{order.orderNumber}</span>
                  <Badge variant="outline" className={`border rounded-full text-xs capitalize ${STATUS_COLORS[order.status] || ""}`}>
                    {order.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {order.shippingName} · {order.shippingEmail}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.shippingCity}, {order.shippingState}
                </p>
              </div>
              <div className="text-right">
                <p className="font-black genz-gradient-text text-lg">₹{order.totalAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>

            <div className="border-t border-border/50 pt-3 mb-3">
              <p className="text-xs text-muted-foreground mb-1 font-bold uppercase tracking-wider">Items</p>
              {order.items?.map((item: any, j: number) => (
                <p key={j} className="text-sm">
                  {item.productName} · Size {item.size} · Qty {item.quantity} · ₹{item.unitPrice.toLocaleString()}
                </p>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={order.status}
                onValueChange={(v: "pending" | "processing" | "shipped" | "delivered") =>
                  updateStatusMutation.mutate({ id: order.id, status: v })
                }
              >
                <SelectTrigger className="w-44 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
