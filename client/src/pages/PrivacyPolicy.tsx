import StorefrontLayout from "@/components/StorefrontLayout";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileText, Mail } from "lucide-react";

export default function PrivacyPolicy() {
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
            <Lock className="w-3.5 h-3.5" /> Data Security & Compliance
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-xs text-muted-foreground">
            Last Updated: {lastUpdated}
          </p>
        </motion.div>

        {/* Content */}
        <div className="space-y-8 bg-card border border-border/60 rounded-2xl p-6 sm:p-8 shadow-xs text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">1. Introduction</h2>
            <p>
              Welcome to <strong>Aarunya / SlayPOP</strong> ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy outlines how your personal data is collected, used, shared, and safeguarded when you visit or make a purchase from our store.
            </p>
          </section>

          <hr className="border-border/40" />

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">2. Information We Collect</h2>
            <p>When you visit our store or place an order, we collect certain information to fulfill your requests:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Contact Information:</strong> Full name, email address, phone number.</li>
              <li><strong>Shipping & Billing Details:</strong> Shipping address, city, state, postal zip code.</li>
              <li><strong>Order History:</strong> Products purchased, sizes, colour choices, timestamps, and order identifiers.</li>
              <li><strong>Payment Information:</strong> All payment transactions are encrypted and processed securely by <strong>Razorpay</strong>. We do not store your full card numbers, CVVs, or bank login credentials on our servers.</li>
            </ul>
          </section>

          <hr className="border-border/40" />

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">3. How We Use Your Information</h2>
            <p>We use the collected information for the following legitimate business purposes:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To process, fulfill, and deliver your clothing orders.</li>
              <li>To send order confirmations, invoice receipts, and courier tracking updates via email.</li>
              <li>To provide customer support and respond to inquiries or return requests.</li>
              <li>To prevent fraudulent transactions and maintain platform security.</li>
            </ul>
          </section>

          <hr className="border-border/40" />

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">4. Data Sharing & Third Parties</h2>
            <p>
              We do not sell, rent, or trade your personal data. We only share necessary data with trusted service providers to run our store:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Payment Gateway:</strong> Razorpay Software Private Limited for secure PCI-DSS compliant payment processing.</li>
              <li><strong>Logistics & Couriers:</strong> Delivery partners to transport your package to your shipping address.</li>
              <li><strong>Authentication & Database:</strong> Supabase (PostgreSQL) for secure database management and encrypted authentication.</li>
            </ul>
          </section>

          <hr className="border-border/40" />

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">5. Cookies & Tracking</h2>
            <p>
              We use minimal, essential session cookies and local storage to keep items in your shopping cart, manage theme preferences, and keep you authenticated. You can control or clear cookies in your browser settings anytime.
            </p>
          </section>

          <hr className="border-border/40" />

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">6. Your Rights & Data Protection Officer</h2>
            <p>
              Under Indian law (Information Technology Act and SPDI Rules), you have the right to access, update, or request deletion of your personal data. For privacy inquiries or grievance redressal, please contact:
            </p>
            <div className="bg-muted/40 rounded-xl p-4 text-xs text-foreground font-medium space-y-1">
              <p><strong>Grievance Officer:</strong> Debangshu Mondal</p>
              <p><strong>Email:</strong> <a href="mailto:debangshumondal7@gmail.com" className="text-primary underline">debangshumondal7@gmail.com</a></p>
              <p><strong>Brand:</strong> Aarunya / SlayPOP</p>
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
