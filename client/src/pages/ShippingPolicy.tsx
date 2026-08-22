import StorefrontLayout from "@/components/StorefrontLayout";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Truck, MapPin, Clock, PackageCheck, AlertCircle, ShieldCheck } from "lucide-react";

export default function ShippingPolicy() {
  return (
    <StorefrontLayout>
      <div className="container max-w-4xl py-12 px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
            <Truck className="w-3.5 h-3.5" /> Fast & Reliable Dispatch
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
            Shipping & Delivery Policy
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Everything you need to know about how your orders are processed, shipped, and delivered.
          </p>
        </motion.div>

        {/* Highlights */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <div className="border border-border/60 bg-card rounded-2xl p-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm mb-1">1-2 Business Days</h3>
            <p className="text-xs text-muted-foreground">Order processing & packaging time</p>
          </div>

          <div className="border border-border/60 bg-card rounded-2xl p-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm mb-1">3–7 Business Days</h3>
            <p className="text-xs text-muted-foreground">Delhivery Express transit time across India</p>
          </div>

          <div className="border border-border/60 bg-card rounded-2xl p-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm mb-1">Free Shipping Above ₹999</h3>
            <p className="text-xs text-muted-foreground">Flat ₹59 shipping on smaller orders</p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 bg-card border border-border/60 rounded-2xl p-6 sm:p-8 shadow-xs">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-foreground text-background text-xs flex items-center justify-center font-black">1</span>
              Shipping Coverage & Courier Partner
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We partner exclusively with <strong>Delhivery Express</strong> to provide high-speed, secure, and trackable doorstep delivery across 18,500+ postal pin codes in India. Orders are prepared and packaged within <strong>1–2 business days</strong>, and delivered to your doorstep within <strong>3 to 7 business days</strong> depending on your region.
            </p>
          </section>

          <hr className="border-border/40" />

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-foreground text-background text-xs flex items-center justify-center font-black">2</span>
              Shipping Charges
            </h2>
            <div className="border border-border/50 rounded-xl overflow-hidden text-sm">
              <div className="grid grid-cols-2 bg-muted/40 p-3 font-bold border-b border-border/50">
                <span>Order Value</span>
                <span>Shipping Fee</span>
              </div>
              <div className="grid grid-cols-2 p-3 border-b border-border/30 text-muted-foreground">
                <span>Orders ₹999 and above</span>
                <span className="font-bold text-green-600 dark:text-green-400">FREE SHIPPING</span>
              </div>
              <div className="grid grid-cols-2 p-3 text-muted-foreground">
                <span>Orders below ₹999</span>
                <span>₹59 Flat Fee</span>
              </div>
            </div>
          </section>

          <hr className="border-border/40" />

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-foreground text-background text-xs flex items-center justify-center font-black">3</span>
              Live Delhivery Order Tracking
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              As soon as your package is scanned at the Delhivery fulfillment hub, you will receive an automated email confirmation with your unique <strong>Delhivery Waybill (AWB) number</strong> and a direct tracking link to follow your parcel at each transit checkpoint.
            </p>
            <p className="text-xs text-muted-foreground">
              You can also check your real-time shipment status anytime under your <Link href="/account" className="font-bold text-primary underline">Account</Link> dashboard.
            </p>
          </section>

          <hr className="border-border/40" />

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-foreground text-background text-xs flex items-center justify-center font-black">4</span>
              Address Accuracy & Delays
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Please ensure your delivery address and phone number are accurate at checkout. In rare cases, deliveries may experience slight delays due to adverse weather conditions, local holidays, or logistical constraints beyond our control.
            </p>
            <div className="bg-muted/40 rounded-xl p-4 text-xs text-muted-foreground">
              For any urgent shipping queries or address corrections prior to dispatch, contact us immediately at{" "}
              <a href="mailto:debangshumondal7@gmail.com" className="font-bold text-foreground underline">
                debangshumondal7@gmail.com
              </a>.
            </div>
          </section>
        </div>

        {/* Back button */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">
            ← Back to Store
          </Link>
        </div>
      </div>
    </StorefrontLayout>
  );
}
