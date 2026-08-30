import { trpc } from "@/lib/trpc";
import StorefrontLayout from "@/components/StorefrontLayout";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, SlidersHorizontal, ChevronDown, Shirt, Sparkles, Scissors, ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useState, useEffect } from "react";

// Hero slides with the user's original product photos
const HERO_SLIDES = [
  {
    image: "/images/hero-1.jpg",
    fallbackImage: "/images/new-arrival-1.png",
    title: "UPCOMING DROPS",
    subtitle: "Chase Your Vision — Tie-Dye Drop",
  },
  {
    image: "/images/hero-2.jpg",
    fallbackImage: "/images/new-arrival-2.png",
    title: "UPCOMING DROPS",
    subtitle: "Speed Racer — Racing Graphic Series",
  },
  {
    image: "/images/new-arrival-3.png",
    fallbackImage: "/images/new-arrival-3.png",
    title: "UPCOMING DROPS",
    subtitle: "Drip Art — Abstract Print Collection",
  },
  {
    image: "/images/new-arrival-4.png",
    fallbackImage: "/images/new-arrival-4.png",
    title: "UPCOMING DROPS",
    subtitle: "Urban Graffiti — Acid Wash Drop",
  },
];

function ProductCard({ product, index }: { product: any; index: number }) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);

  const isLowStock = product.stock <= 5 && product.stock > 0;

  return (
    <Link href={`/product/${product.slug}`}>
      <motion.div
        className="product-card group cursor-pointer"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.04, duration: 0.35 }}
      >
        <div className="product-image relative">
          {product.images?.[0] ? (
            <img
              src={product.images[0].imageUrl}
              alt={product.name}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-5xl font-black text-muted-foreground/20">{product.name[0]}</span>
            </div>
          )}

          {/* Low stock badge */}
          {isLowStock && (
            <div className="absolute top-3 left-3 save-badge">
              Only {product.stock} left
            </div>
          )}

          {/* Sold out overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <span className="text-xs font-bold tracking-widest uppercase text-foreground">Sold Out</span>
            </div>
          )}

          {/* Wishlist heart */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist({
                productId: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                originalPrice: product.originalPrice,
                imageUrl: product.images?.[0]?.imageUrl,
                category: product.category,
                stock: product.stock,
              });
            }}
            className={`wishlist-btn absolute top-3 right-3 ${wishlisted ? "active text-red-500" : ""}`}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className="w-4 h-4" fill={wishlisted ? "currentColor" : "none"} />
          </button>

          {/* Quick add on hover */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileHover={{ opacity: 1, y: 0 }}
            className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addItem({
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  size: "M",
                  quantity: 1,
                  imageUrl: product.images?.[0]?.imageUrl,
                });
              }}
              className="w-full py-2.5 bg-white text-black font-bold text-xs tracking-widest uppercase hover:bg-gray-100 transition-colors"
            >
              Quick Add (Size M)
            </button>
          </motion.div>
        </div>

        <div className="product-info">
          <p className="product-name">{product.name}</p>
          <div className="flex items-center justify-between mt-1">
            <p className="product-price">₹{product.price.toLocaleString()}</p>
            {product.colors && Array.isArray(product.colors) && product.colors.length > 0 && (
              <div className="flex items-center gap-1" title={`${product.colors.length} colours available`}>
                {product.colors.slice(0, 4).map((c: any) => (
                  <span
                    key={c.name}
                    className="w-2.5 h-2.5 rounded-full border border-black/20 shadow-2xs"
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
                {product.colors.length > 4 && (
                  <span className="text-[10px] text-muted-foreground font-semibold">+{product.colors.length - 4}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function CommunityPicksSection() {
  const { data: winners } = trpc.community.featuredWinners.useQuery();
  const latestWinner = winners?.[0];

  if (!latestWinner) return null;

  return (
    <section className="border-t border-border">
      <div className="container py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-black tracking-tight uppercase">Community Pick</h2>
          </div>
          <Link href="/community">
            <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer">
              View All <ChevronRight className="w-3 h-3" />
            </span>
          </Link>
        </div>
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full md:w-64 flex-shrink-0"
          >
            <div className="design-card">
              <div className="design-image relative">
                <img src={latestWinner.imageUrl} alt={latestWinner.title} loading="lazy" />
                <div className="winner-badge">🏆 Winner</div>
              </div>
              <div className="design-info">
                <p className="design-title">{latestWinner.title}</p>
                <p className="design-author">by {latestWinner.submitterName}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Heart className="w-3 h-3" fill="currentColor" />
                  {latestWinner.likeCount} likes
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 text-center md:text-left"
          >
            <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-2">Featured Design</p>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-3">
              This Design Won the Community Vote
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Our community voted and this design by {latestWinner.submitterName} came out on top. Think you can do better?
            </p>
            <Link href="/community">
              <button className="px-8 py-3.5 bg-foreground text-background font-bold text-xs tracking-widest uppercase hover:opacity-90 transition-all flex items-center gap-2 mx-auto md:mx-0">
                <Sparkles className="w-4 h-4" />
                Join the Challenge
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { data: products, isLoading } = trpc.products.list.useQuery({});
  const [sortBy, setSortBy] = useState("featured");
  const [currentSlide, setCurrentSlide] = useState(0);

  const allProducts = products || [];
  const productCount = allProducts.length;

  // Auto-slide hero every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  // Sort products
  const sortedProducts = [...allProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "newest") return b.id - a.id;
    return 0; // featured - default order
  });

  return (
    <StorefrontLayout>
      {/* ═══ Hero Banner Carousel (Original Photos Background) ═══ */}
      <section className="relative w-full overflow-hidden bg-black" style={{ minHeight: "65vh" }}>
        {/* Slide background images */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('${HERO_SLIDES[currentSlide].image}'), url('${HERO_SLIDES[currentSlide].fallbackImage}')`,
            }}
          />
        </AnimatePresence>

        {/* Dark contrast gradient overlay for text readability over full-color photos */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />

        {/* Slide navigation buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 flex items-center justify-center hover:bg-black/80 transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 flex items-center justify-center hover:bg-black/80 transition-all"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-between h-full" style={{ minHeight: "65vh" }}>
          {/* Breadcrumb */}
          <div className="container pt-6">
            <div className="breadcrumb">
              <Link href="/">Home</Link>
              <span>/</span>
              <Link href="/shop">Shop</Link>
              <span>/</span>
              <span>Upcoming Drops</span>
            </div>
          </div>

          {/* Center title & subtitle */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <h2
                  className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white drop-shadow-md uppercase"
                  style={{ letterSpacing: "0.08em" }}
                >
                  {HERO_SLIDES[currentSlide].title}
                </h2>
                <p className="text-white/90 text-sm md:text-lg font-semibold tracking-wider uppercase mt-3 drop-shadow">
                  {HERO_SLIDES[currentSlide].subtitle}
                </p>
                <div className="mt-6">
                  <Link href="/shop">
                    <button className="px-8 py-3.5 bg-white text-black font-bold text-xs tracking-widest uppercase hover:bg-gray-100 transition-all shadow-lg rounded-none">
                      Explore Drop
                    </button>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel indicator dots */}
            <div className="flex items-center gap-2 mt-8">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 transition-all rounded-full ${
                    currentSlide === idx ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* USP Bar */}
          <div className="usp-bar">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="usp-item"
            >
              <span className="usp-icon"><Shirt className="w-3.5 h-3.5" /></span>
              All-Day Comfort Fit
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="usp-item"
            >
              <span className="usp-icon"><Sparkles className="w-3.5 h-3.5" /></span>
              Effortless Fresh Look
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="usp-item"
            >
              <span className="usp-icon"><Scissors className="w-3.5 h-3.5" /></span>
              Easy To Style Silhouettes
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ Filter Bar + Main Product Grid ═══ */}
      <section className="container py-8">
        <div className="filter-bar">
          <Link href="/shop">
            <button className="filter-btn">
              <SlidersHorizontal className="w-4 h-4" />
              Filter and Sort
            </button>
          </Link>

          <div className="flex items-center gap-6">
            <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
              {productCount} Products
            </span>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-16">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-16">
            {sortedProducts.map((product: any, i: number) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && sortedProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-sm">No products available yet.</p>
            <p className="text-muted-foreground text-xs mt-1">Check back soon for new arrivals!</p>
          </div>
        )}
      </section>

      {/* ═══ Community Picks Section ═══ */}
      <CommunityPicksSection />
    </StorefrontLayout>
  );
}
