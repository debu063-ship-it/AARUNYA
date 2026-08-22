import StorefrontLayout from "@/components/StorefrontLayout";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Scale, FileCheck, AlertCircle } from "lucide-react";

export default function TermsOfService() {
  const lastUpdated = "August 2026";

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
            <Scale className="w-3.5 h-3.5" /> Legal Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
            Terms of Service
          </h1>
          <p className="text-xs text-muted-foreground">
            Last Updated: {lastUpdated}
          </p>
        </motion.div>

        {/* Content */}
        <div className="space-y-8 bg-card border border-border/60 rounded-2xl p-6 sm:p-8 shadow-xs text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">1. Overview & Agreement</h2>
            <p>
              This website is operated by <strong>Aarunya / SlayPOP</strong>. Throughout the site, the terms "we", "us", and "our" refer to Aarunya / SlayPOP. By visiting our site or purchasing from us, you engage in our "Service" and agree to be bound by the following terms and conditions ("Terms of Service", "Terms").
            </p>
          </section>

          <hr className="border-border/40" />

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">2. Online Store Terms & Eligibility</h2>
            <p>
              By agreeing to these Terms, you represent that you are at least 18 years of age or have obtained parental/guardian consent to use this site. You agree not to use our products for any unauthorized or illegal purpose.
            </p>
          </section>

          <hr className="border-border/40" />

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">3. Products, Pricing & Accuracy</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Pricing:</strong> All prices are displayed in Indian Rupees (INR ₹) inclusive of applicable taxes. We reserve the right to modify prices at any time without prior notice.</li>
              <li><strong>Product Images:</strong> We have made every effort to display as accurately as possible the colors and details of our apparel. We cannot guarantee that your device screen display of any color will be 100% identical.</li>
              <li><strong>Stock:</strong> Products are subject to limited availability. We reserve the right to limit sales quantities per person or order.</li>
            </ul>
          </section>

          <hr className="border-border/40" />

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">4. Payment & Billing</h2>
            <p>
              We provide secure online payment options powered by Razorpay (UPI, Credit/Debit Cards, Net Banking). You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store.
            </p>
          </section>

          <hr className="border-border/40" />

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">5. Strict Return & Cancellation Terms</h2>
            <div className="bg-muted/40 rounded-xl p-4 text-xs text-foreground font-medium space-y-1">
              <p>• <strong>Returns / Exchanges:</strong> Must be reported strictly within <strong>24 hours of delivery</strong>.</p>
              <p>• <strong>Cancellations:</strong> Cannot be cancelled once the order is in <strong>"Processing"</strong> or <strong>"Shipped"</strong> status.</p>
              <p>• Please review our full <Link href="/refund-policy" className="text-primary underline">Refund & Cancellation Policy</Link> for detailed steps.</p>
            </div>
          </section>

          <hr className="border-border/40" />

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">6. Intellectual Property & Community Submissions</h2>
            <p>
              All trademarks, graphics, logos, text, and garment designs are the intellectual property of Aarunya / SlayPOP. Community members submitting designs to our design rounds grant us a non-exclusive license to showcase and feature submitted artwork on our platform.
            </p>
          </section>

          <hr className="border-border/40" />

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">7. Governing Law & Jurisdiction</h2>
            <p>
              These Terms of Service and any separate agreements shall be governed by and construed in accordance with the laws of <strong>India</strong>, and any disputes shall be subject to the exclusive jurisdiction of the competent courts in West Bengal, India.
            </p>
          </section>

          <hr className="border-border/40" />

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">8. Contact Information</h2>
            <p>
              Questions about the Terms of Service should be sent to:
            </p>
            <p className="font-bold text-foreground">
              Email: <a href="mailto:debangshumondal7@gmail.com" className="text-primary underline">debangshumondal7@gmail.com</a>
            </p>
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
