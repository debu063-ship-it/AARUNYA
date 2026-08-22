import StorefrontNav from "@/components/StorefrontNav";
import { Link } from "wouter";
import { SlayPopLogo } from "@/components/SlayPopLogo";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StorefrontNav />
      <main>{children}</main>
      <footer className="border-t border-border mt-16">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <SlayPopLogo className="h-6 w-auto text-foreground shrink-0" />
                <p className="text-xl font-black tracking-tight text-foreground">SlayPOP</p>
              </div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">wear the moment.</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Premium streetwear for those who dare to stand out. Quality fabrics, bold designs, Indian roots.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold tracking-widest uppercase text-foreground mb-4">Quick Links</h4>
              <div className="space-y-2.5">
                <Link href="/shop" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">
                  Shop All
                </Link>
                <Link href="/shop?category=tops" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">
                  Tops
                </Link>
                <Link href="/shop?category=bottoms" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">
                  Bottoms
                </Link>
                <Link href="/shop?category=accessories" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">
                  Accessories
                </Link>
              </div>
            </div>

            {/* Help & Support */}
            <div>
              <h4 className="text-xs font-bold tracking-widest uppercase text-foreground mb-4">Help & Support</h4>
              <div className="space-y-2.5">
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">
                  Contact Us
                </Link>
                <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">
                  FAQ
                </Link>
                <Link href="/refund-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">
                  Returns & Cancellations
                </Link>
                <Link href="/shipping-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">
                  Shipping Policy
                </Link>
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-xs font-bold tracking-widest uppercase text-foreground mb-4">Stay Updated</h4>
              <p className="text-sm text-muted-foreground mb-3">Get notified about new drops & exclusive offers.</p>
              <form onSubmit={(e) => e.preventDefault()} className="flex">
                <input
                  type="email"
                  placeholder="Email address"
                  className="flex-1 px-3 py-2 text-sm border border-border bg-background text-foreground focus:outline-none focus:border-foreground transition-colors"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-foreground text-background text-xs font-bold tracking-wider uppercase hover:opacity-90 transition-opacity"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Aarunya / SlayPOP. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <span>·</span>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <span>·</span>
              <Link href="/refund-policy" className="hover:text-foreground transition-colors">
                Refund Policy
              </Link>
              <span>·</span>
              <Link href="/shipping-policy" className="hover:text-foreground transition-colors">
                Shipping Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
