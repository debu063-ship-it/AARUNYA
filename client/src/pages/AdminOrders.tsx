import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ShoppingBag, Truck, Printer, ExternalLink, Copy, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  shipped: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  delivered: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

export default function AdminOrders() {
  const { data: orders, isLoading } = trpc.adminOrders.list.useQuery(undefined, { staleTime: 5000 });
  const utils = trpc.useUtils();
  const [shippingOrderId, setShippingOrderId] = useState<number | null>(null);

  const updateStatusMutation = trpc.adminOrders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Order status updated");
      utils.adminOrders.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const createShipmentMutation = trpc.adminOrders.createDelhiveryShipment.useMutation({
    onSuccess: (data) => {
      toast.success(`Delhivery shipment created! AWB: ${data.waybill}`);
      setShippingOrderId(null);
      utils.adminOrders.list.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create shipment");
      setShippingOrderId(null);
    },
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
                  {item.productName} · {item.color ? `${item.color} · ` : ""}Size {item.size} · Qty {item.quantity} · ₹{item.unitPrice.toLocaleString()}
                </p>
              ))}
            </div>

            {/* Delhivery Shipment Details & Actions */}
            <div className="border-t border-border/50 pt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Select
                  value={order.status}
                  onValueChange={(v: "pending" | "processing" | "shipped" | "delivered" | "cancelled") =>
                    updateStatusMutation.mutate({ id: order.id, status: v })
                  }
                >
                  <SelectTrigger className="w-40 rounded-xl text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                {order.waybill ? (
                  <div className="flex items-center gap-2 bg-muted/60 border border-border/60 rounded-xl px-3 py-1.5 text-xs">
                    <Truck className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span className="font-bold text-foreground">AWB:</span>
                    <span className="font-mono text-primary font-bold">{order.waybill}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(order.waybill);
                        toast.success("AWB copied!");
                      }}
                      className="text-muted-foreground hover:text-foreground p-1"
                      title="Copy AWB"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <a
                      href={`https://www.delhivery.com/track/package/${order.waybill}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary p-1"
                      title="Track on Delhivery"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    disabled={createShipmentMutation.isPending && shippingOrderId === order.id}
                    onClick={() => {
                      setShippingOrderId(order.id);
                      createShipmentMutation.mutate({ orderId: order.id });
                    }}
                    className="gap-1.5 genz-gradient-bg text-primary-foreground border-0 rounded-xl font-bold text-xs h-9 hover:opacity-90 shadow-2xs"
                  >
                    {createShipmentMutation.isPending && shippingOrderId === order.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Truck className="w-3.5 h-3.5" />
                    )}
                    Ship with Delhivery
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
