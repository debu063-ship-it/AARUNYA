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

            {/* Help */}
            <div>
              <h4 className="text-xs font-bold tracking-widest uppercase text-foreground mb-4">Help</h4>
              <div className="space-y-2.5">
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors block cursor-default">Contact Us</span>
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors block cursor-default">FAQ</span>
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors block cursor-default">Returns & Exchanges</span>
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors block cursor-default">Shipping Policy</span>
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

          <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} SlayPOP. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Crafted with ♥ in India
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
