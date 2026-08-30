import StorefrontLayout from "@/components/StorefrontLayout";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";
import { Mail, Clock, HelpCircle, Send, CheckCircle2, Phone, MapPin, Instagram, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const FAQS = [
  {
    q: "How do I request a return or exchange?",
    a: "We have a strict 24-hour return policy. You must email debangshumondal7@gmail.com within 24 hours of receiving your order with your Order ID and photo/video proof of the unworn product with tags attached.",
  },
  {
    q: "Can I cancel my order?",
    a: "You can request cancellation only before your order moves to 'Processing' or 'Shipped' status. Once processing or packaging starts, cancellations are strictly not permitted.",
  },
  {
    q: "How long will delivery take?",
    a: "Orders are processed in 1–2 business days and delivered within 10–15 days across India. Shipping is FREE on all orders of ₹999 and above (flat ₹59 on smaller orders).",
  },
  {
    q: "How can I track my shipment?",
    a: "Once dispatched, you will receive an email with your courier tracking link. You can also view live status in your Account page under 'My Orders'.",
  },
  {
    q: "What payment options are supported?",
    a: "We support instant, secure payments via Razorpay — including UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards (Visa, Mastercard, RuPay), and Netbanking.",
  },
];

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    orderNumber: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Message sent! Our team will get back to you within 24 hours.");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to send message. Please try again or email us directly.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message || !formData.subject) {
      toast.error("Please fill in all required fields.");
      return;
    }
    submitMutation.mutate({
      name: formData.name.trim(),
      email: formData.email.trim(),
      orderNumber: formData.orderNumber.trim() || undefined,
      subject: formData.subject.trim(),
      message: formData.message.trim(),
    });
  };

  return (
    <StorefrontLayout>
      <div className="container max-w-5xl py-12 px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
            <Mail className="w-3.5 h-3.5" /> Customer Care
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
            Help & Contact Support
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Got questions about sizing, drops, or your order? We're here to help.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Contact Info Cards */}
          <div className="space-y-4">
            <div className="border border-border/60 bg-card rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground mb-1">Email Support</h3>
              <p className="text-xs text-muted-foreground mb-2">Direct response within 24 hours</p>
              <a
                href="mailto:debangshumondal7@gmail.com"
                className="text-sm font-bold text-primary hover:underline break-all"
              >
                debangshumondal7@gmail.com
              </a>
            </div>

            <div className="border border-border/60 bg-card rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground mb-1">Working Hours</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Monday – Saturday<br />
                <strong>10:00 AM – 7:00 PM IST</strong>
              </p>
            </div>

            <div className="border border-border/60 bg-card rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center mb-3">
                <Instagram className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground mb-1">Instagram</h3>
              <p className="text-xs text-muted-foreground mb-2">Drop alerts & customer DMs</p>
              <a
                href="https://www.instagram.com/slaypop.co.in?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-pink-500 hover:underline"
              >
                @slaypop.co.in
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2 border border-border/60 bg-card rounded-2xl p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-black tracking-tight mb-4">Send Us a Message</h2>

            {submitted ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold">Thank you for reaching out!</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  We have received your message and our team will get back to you at <strong>{formData.email}</strong> shortly.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", orderNumber: "", subject: "", message: "" });
                  }}
                  className="rounded-xl mt-4 text-xs font-bold"
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider">Your Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Alex Sharma"
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider">Your Email *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                      placeholder="alex@example.com"
                      required
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider">Order ID (Optional)</Label>
                    <Input
                      value={formData.orderNumber}
                      onChange={(e) => setFormData((p) => ({ ...p, orderNumber: e.target.value }))}
                      placeholder="e.g. ORD-12345"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider">Subject *</Label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
                      placeholder="e.g. Sizing / Return Query"
                      required
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider">Message *</Label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                    placeholder="How can we help you today?"
                    rows={4}
                    required
                    className="rounded-xl"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="w-full py-6 genz-gradient-bg text-primary-foreground border-0 rounded-xl font-bold tracking-wider uppercase text-xs hover:opacity-90 transition-all gap-2"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send Message
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* FAQs */}
        <div className="border-t border-border pt-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black tracking-tight mb-2 flex items-center justify-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" /> Frequently Asked Questions
            </h2>
            <p className="text-xs text-muted-foreground">Quick answers to common questions</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-border/60 bg-card rounded-2xl p-5 space-y-2">
                <h3 className="font-bold text-sm text-foreground">{faq.q}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Back button */}
        <div className="mt-12 text-center">
          <Link href="/" className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">
            ← Back to Store
          </Link>
        </div>
      </div>
    </StorefrontLayout>
  );
}
