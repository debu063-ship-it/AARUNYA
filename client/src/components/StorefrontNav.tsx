import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import {
  ShoppingBag,
  User,
  Menu,
  X,
  LogOut,
  Package,
  Sun,
  Moon,
  Search,
  Heart,
  ChevronDown,
  Sparkles,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerAuthModal } from "@/components/CustomerAuthModal";
import { SlayPopLogo } from "@/components/SlayPopLogo";

const CATEGORIES = [
  { slug: "tops", label: "Tops" },
  { slug: "bottoms", label: "Bottoms" },
  { slug: "outerwear", label: "Outerwear" },
  { slug: "accessories", label: "Accessories" },
  { slug: "co-ords", label: "Co-ords" },
];

export default function StorefrontNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location, setLocation] = useLocation();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShopDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* Top Ticker */}
      <div className="ticker">
        <div className="ticker-content">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex">
              <span className="ticker-item">
                FREE SHIPPING ABOVE ₹999
              </span>
              <span className="ticker-item">
                NEW DROP EVERY FRIDAY
              </span>
              <span className="ticker-item">
                EASY RETURNS & EXCHANGES
              </span>
              <span className="ticker-item">
                COD AVAILABLE
              </span>
            </div>
          ))}
        </div>
      </div>

      <nav className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container flex items-center justify-between h-16">
          {/* Left: Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`text-xs font-semibold tracking-wider uppercase px-3 py-2 transition-colors ${
                location === "/"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Home
            </Link>

            {/* Shop dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setShopDropdownOpen(!shopDropdownOpen)}
                onMouseEnter={() => setShopDropdownOpen(true)}
                className={`text-xs font-semibold tracking-wider uppercase px-3 py-2 transition-colors flex items-center gap-1 ${
                  location === "/shop"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Shop
                <ChevronDown className={`w-3 h-3 transition-transform ${shopDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {shopDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1 w-48 bg-background border border-border shadow-lg z-50"
                    onMouseLeave={() => setShopDropdownOpen(false)}
                  >
                    <Link
                      href="/shop"
                      onClick={() => setShopDropdownOpen(false)}
                      className="block px-4 py-2.5 text-xs font-semibold tracking-wider uppercase text-foreground hover:bg-muted transition-colors border-b border-border"
                    >
                      All Products
                    </Link>
                    {CATEGORIES.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/shop?category=${cat.slug}`}
                        onClick={() => setShopDropdownOpen(false)}
                        className="block px-4 py-2.5 text-xs font-medium tracking-wide uppercase text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        {cat.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/shop?category=accessories"
              className="text-xs font-semibold tracking-wider uppercase px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Accessories
            </Link>

            <Link
              href="/community"
              className={`text-xs font-semibold tracking-wider uppercase px-3 py-2 transition-colors flex items-center gap-1 ${
                location === "/community"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              Community
            </Link>

            <Link
              href="/suggestions"
              className={`text-xs font-semibold tracking-wider uppercase px-3 py-2 transition-colors flex items-center gap-1 ${
                location === "/suggestions"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Lightbulb className="w-3 h-3" />
              Suggestions
            </Link>
          </div>

          {/* Center: Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:absolute md:left-1/2 md:-translate-x-1/2 flex items-center gap-2 group">
            <SlayPopLogo className="h-6 md:h-8 w-auto text-foreground transition-transform group-hover:scale-105" />
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground leading-none">
              SlayPOP
            </h1>
          </Link>

          {/* Right: Search + Icons (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search bar */}
            <form onSubmit={handleSearch} className="search-bar" style={{ width: searchFocused ? "220px" : "180px", transition: "width 0.2s ease" }}>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <button type="submit" aria-label="Search">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>

            {/* User */}
            {user ? (
              <div className="flex items-center gap-1">
                <Link href="/account">
                  <button className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" aria-label="My Orders">
                    <Package className="w-[18px] h-[18px]" />
                  </button>
                </Link>
                <button
                  onClick={logout}
                  className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-[18px] h-[18px]" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Login"
              >
                <User className="w-[18px] h-[18px]" />
              </button>
            )}

            {/* Wishlist (visual only) */}
            <button
              className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-[18px] h-[18px]" />
            </button>

            {/* Cart */}
            <Link href="/cart">
              <button className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative" aria-label="Cart">
                <ShoppingBag className="w-[18px] h-[18px]" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-foreground text-background rounded-full text-[10px] flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </button>
            </Link>
          </div>

          {/* Mobile: Icons */}
          <div className="flex md:hidden items-center gap-1">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link href="/cart" className="relative">
              <button className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative">
                <ShoppingBag className="w-4 h-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-foreground text-background rounded-full text-[10px] flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </button>
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="w-9 h-9 flex items-center justify-center text-foreground"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border overflow-hidden bg-background"
            >
              <div className="container py-4 flex flex-col gap-1">
                {/* Mobile search */}
                <form onSubmit={(e) => { handleSearch(e); setMobileOpen(false); }} className="search-bar mb-3">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" aria-label="Search">
                    <Search className="w-4 h-4" />
                  </button>
                </form>

                <Link href="/" onClick={() => setMobileOpen(false)}>
                  <span className={`text-sm font-medium block py-2.5 px-3 transition-colors ${
                    location === "/" ? "text-foreground font-semibold bg-muted" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}>
                    Home
                  </span>
                </Link>
                <Link href="/shop" onClick={() => setMobileOpen(false)}>
                  <span className={`text-sm font-medium block py-2.5 px-3 transition-colors ${
                    location === "/shop" ? "text-foreground font-semibold bg-muted" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}>
                    All Products
                  </span>
                </Link>
                {CATEGORIES.map((cat) => (
                  <Link key={cat.slug} href={`/shop?category=${cat.slug}`} onClick={() => setMobileOpen(false)}>
                    <span className="text-sm font-medium block py-2 px-6 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      {cat.label}
                    </span>
                  </Link>
                ))}

                <Link href="/community" onClick={() => setMobileOpen(false)}>
                  <span className={`text-sm font-medium block py-2.5 px-3 transition-colors flex items-center gap-2 ${
                    location === "/community" ? "text-foreground font-semibold bg-muted" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}>
                    <Sparkles className="w-4 h-4" />
                    Community
                  </span>
                </Link>

                <Link href="/suggestions" onClick={() => setMobileOpen(false)}>
                  <span className={`text-sm font-medium block py-2.5 px-3 transition-colors flex items-center gap-2 ${
                    location === "/suggestions" ? "text-foreground font-semibold bg-muted" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}>
                    <Lightbulb className="w-4 h-4" />
                    Suggestions
                  </span>
                </Link>

                <div className="border-t border-border mt-2 pt-2">
                  {user ? (
                    <>
                      <Link href="/account" onClick={() => setMobileOpen(false)}>
                        <span className="text-sm font-medium block py-2.5 px-3 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2">
                          <Package className="w-4 h-4" /> My Orders
                        </span>
                      </Link>
                      <button
                        onClick={() => { logout(); setMobileOpen(false); }}
                        className="text-sm font-medium block py-2.5 px-3 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors w-full text-left flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { setAuthModalOpen(true); setMobileOpen(false); }}
                      className="text-sm font-medium block py-2.5 px-3 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors w-full text-left flex items-center gap-2"
                    >
                      <User className="w-4 h-4" /> Login
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <CustomerAuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
}
