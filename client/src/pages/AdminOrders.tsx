import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Truck,
  ExternalLink,
  Copy,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PlusCircle,
  Trash2,
  RefreshCw,
  FileText,
  CreditCard,
  Package,
} from "lucide-react";
import { useState } from "react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  processing: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  shipped: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  delivered: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

export default function AdminOrders() {
  const { data: orders, isLoading, refetch } = trpc.adminOrders.list.useQuery(undefined, { staleTime: 5000 });
  const utils = trpc.useUtils();

  const [activeTab, setActiveTab] = useState<"all" | "processing" | "shipped" | "delivered" | "cancelled">("all");
  const [shippingOrderId, setShippingOrderId] = useState<number | null>(null);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoPaymentState, setDemoPaymentState] = useState<"paid" | "cancelled" | "unpaid">("paid");
  const [demoName, setDemoName] = useState("Debangshu Mondal");
  const [demoCity, setDemoCity] = useState("Kolkata");
  const [demoPin, setDemoPin] = useState("700091");

  const updateStatusMutation = trpc.adminOrders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Order status updated");
      utils.adminOrders.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteOrderMutation = trpc.adminOrders.deleteOrder.useMutation({
    onSuccess: () => {
      toast.success("Order deleted successfully");
      utils.adminOrders.list.invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to delete order"),
  });

  const createShipmentMutation = trpc.adminOrders.createDelhiveryShipment.useMutation({
    onSuccess: (data) => {
      if (data.isSimulated) {
        toast.warning(data.message || `Created Simulated AWB: ${data.waybill}`, { duration: 6000 });
      } else {
        toast.success(`Live Delhivery shipment created! AWB: ${data.waybill}`);
      }
      setShippingOrderId(null);
      utils.adminOrders.list.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create shipment");
      setShippingOrderId(null);
    },
  });

  const createDemoOrderMutation = trpc.adminOrders.createDemoOrder.useMutation({
    onSuccess: (data) => {
      toast.success(`Demo order #${data.orderNumber} created (${data.paymentState.toUpperCase()})`);
      setDemoModalOpen(false);
      utils.adminOrders.list.invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to create demo order"),
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse h-8 w-48 bg-muted rounded-xl mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-muted/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const allOrdersList = orders || [];
  const filteredOrders = allOrdersList.filter((o: any) => {
    if (activeTab === "all") return true;
    if (activeTab === "processing") return o.status === "processing";
    if (activeTab === "shipped") return o.status === "shipped";
    if (activeTab === "delivered") return o.status === "delivered";
    if (activeTab === "cancelled") return o.status === "cancelled" || (o.status === "pending" && !o.razorpayPaymentId);
    return true;
  });

  const counts = {
    all: allOrdersList.length,
    processing: allOrdersList.filter((o: any) => o.status === "processing").length,
    shipped: allOrdersList.filter((o: any) => o.status === "shipped").length,
    delivered: allOrdersList.filter((o: any) => o.status === "delivered").length,
    cancelled: allOrdersList.filter((o: any) => o.status === "cancelled" || (o.status === "pending" && !o.razorpayPaymentId)).length,
  };

  const handleCreateDemo = (e: React.FormEvent) => {
    e.preventDefault();
    createDemoOrderMutation.mutate({
      paymentState: demoPaymentState,
      shippingName: demoName,
      shippingCity: demoCity,
      shippingZipCode: demoPin,
      shippingAddress: "Flat 4B, Greenfield Heights, Action Area 1",
      shippingPhone: "8777648392",
      shippingEmail: "demo@slaypop.in",
      shippingState: "West Bengal",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Orders & Fulfillment</h1>
          <p className="text-sm text-muted-foreground">Manage customer purchases, payments, and Delhivery shipments</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="rounded-xl gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>

          <Dialog open={demoModalOpen} onOpenChange={setDemoModalOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="gap-1.5 genz-gradient-bg text-primary-foreground border-0 rounded-xl font-bold text-xs shadow-xs hover:opacity-90"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Create Demo Order
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-black">Generate Demo Order</DialogTitle>
                <DialogDescription className="text-xs">
                  Create a simulated test order to test checkout handling, payment states, and Delhivery fulfillment.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateDemo} className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Payment State</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDemoPaymentState("paid")}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        demoPaymentState === "paid"
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "border-border/60 hover:bg-muted"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
                      Paid (Processing)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDemoPaymentState("cancelled")}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        demoPaymentState === "cancelled"
                          ? "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400"
                          : "border-border/60 hover:bg-muted"
                      }`}
                    >
                      <XCircle className="w-4 h-4 mx-auto mb-1 text-red-500" />
                      Cancelled / Aborted
                    </button>
                    <button
                      type="button"
                      onClick={() => setDemoPaymentState("unpaid")}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        demoPaymentState === "unpaid"
                          ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "border-border/60 hover:bg-muted"
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4 mx-auto mb-1 text-amber-500" />
                      Pending / Unpaid
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Customer Name</Label>
                  <Input
                    value={demoName}
                    onChange={(e) => setDemoName(e.target.value)}
                    required
                    className="rounded-xl text-xs h-9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">City</Label>
                    <Input
                      value={demoCity}
                      onChange={(e) => setDemoCity(e.target.value)}
                      required
                      className="rounded-xl text-xs h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">Pincode</Label>
                    <Input
                      value={demoPin}
                      onChange={(e) => setDemoPin(e.target.value)}
                      required
                      className="rounded-xl text-xs h-9"
                    />
                  </div>
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="submit"
                    disabled={createDemoOrderMutation.isPending}
                    className="w-full genz-gradient-bg text-primary-foreground border-0 rounded-xl font-bold text-xs h-9 hover:opacity-90"
                  >
                    {createDemoOrderMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                    Spawn Test Order
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/50 rounded-2xl border border-border/40 w-fit">
        {[
          { id: "all", label: "All Orders", count: counts.all },
          { id: "processing", label: "Paid / Processing", count: counts.processing },
          { id: "shipped", label: "Shipped", count: counts.shipped },
          { id: "delivered", label: "Delivered", count: counts.delivered },
          { id: "cancelled", label: "Cancelled / Unpaid", count: counts.cancelled },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === tab.id
                ? "bg-card text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            <span
              className={`px-1.5 py-0.2 text-[10px] rounded-full ${
                activeTab === tab.id ? "bg-primary/10 text-primary font-black" : "bg-muted text-muted-foreground"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border/60 rounded-2xl bg-card/50">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-bold text-foreground">No orders in this view</p>
          <p className="text-xs text-muted-foreground mt-1">
            {activeTab === "all" ? "No customer orders have been placed yet." : `There are no ${activeTab} orders.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          <AnimatePresence>
            {filteredOrders.map((order: any, i: number) => {
              const isPaid = !!order.razorpayPaymentId;
              const isCancelled = order.status === "cancelled";
              const isPendingUnpaid = order.status === "pending" && !order.razorpayPaymentId;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.02 }}
                  className="border border-border/50 rounded-2xl p-5 bg-card genz-card-hover shadow-xs"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-black text-foreground">{order.orderNumber}</span>
                        <Badge variant="outline" className={`border rounded-full text-xs font-bold capitalize ${STATUS_COLORS[order.status] || ""}`}>
                          {order.status}
                        </Badge>

                        {/* Payment Status Badge */}
                        {isPaid ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px] gap-1 font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Paid
                          </Badge>
                        ) : isCancelled ? (
                          <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 text-[11px] gap-1 font-bold">
                            <XCircle className="w-3 h-3" /> Payment Cancelled
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[11px] gap-1 font-bold">
                            <AlertTriangle className="w-3 h-3" /> Checkout Unpaid
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground font-medium">
                        {order.shippingName} · <span className="text-foreground/80">{order.shippingEmail}</span> · {order.shippingPhone}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.shippingAddress}, {order.shippingCity}, {order.shippingState} - {order.shippingZipCode}
                      </p>
                      {order.razorpayPaymentId && (
                        <p className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-emerald-500" />
                          Txn ID: {order.razorpayPaymentId}
                        </p>
                      )}
                    </div>

                    <div className="text-left sm:text-right flex sm:flex-col justify-between items-end sm:items-end">
                      <p className="font-black genz-gradient-text text-xl">₹{order.totalAmount.toLocaleString()}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="border-t border-border/40 pt-3 mb-3 bg-muted/20 -mx-5 px-5 py-2.5">
                    <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Package className="w-3 h-3" /> Ordered Items ({order.items?.length || 0})
                    </p>
                    <div className="space-y-1">
                      {order.items?.map((item: any, j: number) => (
                        <p key={j} className="text-xs text-foreground/90 font-medium">
                          • {item.productName} {item.color ? `(${item.color})` : ""} · Size <span className="font-bold">{item.size}</span> · Qty <span className="font-bold">{item.quantity}</span> · ₹{item.unitPrice.toLocaleString()}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Delhivery Shipment & Status Actions */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Select
                        value={order.status}
                        onValueChange={(v: "pending" | "processing" | "shipped" | "delivered" | "cancelled") =>
                          updateStatusMutation.mutate({ id: order.id, status: v })
                        }
                      >
                        <SelectTrigger className="w-36 rounded-xl text-xs h-9 font-semibold">
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

                      {(isCancelled || isPendingUnpaid) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deleteOrderMutation.isPending}
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete order ${order.orderNumber}?`)) {
                              deleteOrderMutation.mutate({ orderId: order.id });
                            }
                          }}
                          className="h-9 px-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl"
                          title="Delete test/cancelled order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
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
                            className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                            title="Copy AWB"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <a
                            href={`https://www.delhivery.com/track/package/${order.waybill}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary p-1 transition-colors"
                            title="Track on Delhivery"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            disabled={createShipmentMutation.isPending && shippingOrderId === order.id}
                            onClick={() => {
                              if (!isPaid && !confirm(`This order is marked as ${order.status.toUpperCase()} / UNPAID. Do you still want to generate a Delhivery shipment for it?`)) {
                                return;
                              }
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
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
