import StorefrontLayout from "@/components/StorefrontLayout";
import { useSearch, Link } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderConfirmed() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const orderNumber = params.get("order") || "";

  return (
    <StorefrontLayout>
      <div className="container py-16 text-center relative overflow-hidden">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-green-500" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Order Confirmed</h1>
          <p className="text-muted-foreground mb-6 text-sm">Thank you for your purchase!</p>

          {orderNumber && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-block genz-glass rounded-2xl px-8 py-5 mb-6 max-w-md w-full"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Order Number</p>
              <p className="text-2xl font-mono font-black genz-gradient-text mb-3">{orderNumber}</p>
              <div className="border-t border-border/40 pt-3 text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">🚚 Handled by Delhivery Express</p>
                <p>We are preparing your items. You will receive an email and SMS with your live Delhivery tracking link once dispatched.</p>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link href="/account">
              <Button className="gap-2 genz-gradient-bg text-primary-foreground border-0 rounded-full px-8 font-bold hover:opacity-90">
                View My Orders <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/shop">
              <Button variant="outline" className="rounded-full px-8 font-bold">Continue Shopping</Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </StorefrontLayout>
  );
}
