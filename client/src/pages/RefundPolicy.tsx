import StorefrontLayout from "@/components/StorefrontLayout";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Clock, Ban, RotateCcw, AlertTriangle, CheckCircle2, Mail, ShieldCheck } from "lucide-react";

export default function RefundPolicy() {
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
            <ShieldCheck className="w-3.5 h-3.5" /> Customer Trust & Policy
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
            Refund & Cancellation Policy
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Please read our return, refund, and order cancellation guidelines carefully.
          </p>
        </motion.div>

        {/* Highlight Alert Cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <div className="border border-red-500/30 bg-red-500/5 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground mb-1">Strict 24-Hour Return Window</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Return or exchange requests must be reported within <strong>24 hours of delivery</strong>. Requests raised after 24 hours cannot be entertained.
                </p>
              </div>
            </div>
          </div>

          <div className="border border-amber-500/30 bg-amber-500/5 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground mb-1">Order Cancellation Policy</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Orders cannot be cancelled once they have entered <strong>"Processing"</strong> or <strong>"Shipped"</strong> status as printing and packing begins immediately.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 bg-card border border-border/60 rounded-2xl p-6 sm:p-8 shadow-xs">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-foreground text-background text-xs flex items-center justify-center font-black">1</span>
              Returns & Exchange Eligibility
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We take pride in delivering premium quality streetwear. To be eligible for a return or exchange:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground pl-4">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>The request must be submitted via email within <strong>24 hours of package delivery</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Items must be <strong>unworn, unwashed, undamaged</strong>, and in their original condition with all brand tags intact.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Products must be sent back in their original packaging.</span>
              </li>
            </ul>
          </section>

          <hr className="border-border/40" />

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-foreground text-background text-xs flex items-center justify-center font-black">2</span>
              Damaged, Defective, or Wrong Item
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you receive a defective, damaged, or incorrect item, please email us immediately at{" "}
              <a href="mailto:debangshumondal7@gmail.com" className="font-bold text-primary underline">
                debangshumondal7@gmail.com
              </a>{" "}
              within 24 hours of delivery with:
            </p>
            <div className="bg-muted/40 rounded-xl p-4 text-xs space-y-1.5 font-medium text-foreground">
              <p>• Your Order ID (e.g. <code>ORD-XXXXX</code>)</p>
              <p>• Clear photos or an unboxing video showing the defect/damage</p>
              <p>• Description of the issue</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Upon verification, we will arrange a replacement at zero additional cost to you or initiate a full refund.
            </p>
          </section>

          <hr className="border-border/40" />

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-foreground text-background text-xs flex items-center justify-center font-black">3</span>
              Cancellation Rules
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You may request order cancellation within <strong>2 hours of placing the order</strong> provided it has not entered the "Processing" stage.
            </p>
            <div className="bg-amber-500/10 text-amber-900 dark:text-amber-200 border border-amber-500/20 rounded-xl p-3.5 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <span>
                Once an order is moved to <strong>Processing, Shipped, or Out for Delivery</strong>, cancellations are strictly not permitted.
              </span>
            </div>
          </section>

          <hr className="border-border/40" />

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-foreground text-background text-xs flex items-center justify-center font-black">4</span>
              Refund Process & Timeline
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Once your returned item is received and inspected at our facility, we will notify you of the approval or rejection of your refund.
            </p>
            <ul className="space-y-1.5 text-sm text-muted-foreground pl-4">
              <li>• <strong>Approved Refunds:</strong> Credited back to the original payment source (UPI / Card / Netbanking) within <strong>5 to 7 business days</strong>.</li>
              <li>• <strong>COD / Manual Orders:</strong> Refunds will be issued via NEFT/UPI transfer to the customer's provided bank account details.</li>
            </ul>
          </section>

          <hr className="border-border/40" />

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-foreground text-background text-xs flex items-center justify-center font-black">5</span>
              Contact for Support
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For any questions or to initiate a request, please reach out to our team:
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-primary" />
              <span>Email: <a href="mailto:debangshumondal7@gmail.com" className="font-bold hover:underline">debangshumondal7@gmail.com</a></span>
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
