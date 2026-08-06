import { trpc } from "@/lib/trpc";
import StorefrontLayout from "@/components/StorefrontLayout";
import { useCart } from "@/contexts/CartContext";
import { Link, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  SlidersHorizontal,
  ChevronDown,
  X,
  Heart,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "tops", label: "Tops" },
  { value: "bottoms", label: "Bottoms" },
  { value: "outerwear", label: "Outerwear" },
  { value: "accessories", label: "Accessories" },
  { value: "co-ords", label: "Co-ords" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function Shop() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialCategory = params.get("category") || "all";
  const searchQuery = params.get("search") || "";

  const [category, setCategory] = useState(initialCategory);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("featured");

  const { data: products, isLoading } = trpc.products.list.useQuery(
    {
      category: category !== "all" ? category : undefined,
      minPrice: priceRange[0] || undefined,
      maxPrice: priceRange[1] < 50000 ? priceRange[1] : undefined,
    },
    { staleTime: 5000 }
  );

  // Client-side filtering
  let filtered = selectedSize
    ? products?.filter(p => (p.category === "accessories" ? selectedSize === "ONE" : true))
    : products;

  // Search filter
  if (searchQuery && filtered) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
  }

  // Sort
  const sorted = [...(filtered || [])].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "newest") return b.id - a.id;
    return 0;
  });

  const { addItem } = useCart();
  const [wishlisted, setWishlisted] = useState<Set<number>>(new Set());

  const toggleWishlist = (id: number) => {
    setWishlisted(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const activeFilters = (category !== "all" ? 1 : 0) + (selectedSize ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 50000 ? 1 : 0);

  return (
    <StorefrontLayout>
      <div className="container py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="breadcrumb" style={{ color: "var(--muted-foreground)" }}>
            <Link href="/" style={{ color: "var(--muted-foreground)" }}>Home</Link>
            <span style={{ color: "var(--muted-foreground)" }}>/</span>
            <span style={{ color: "var(--foreground)", fontWeight: 500 }}>Shop</span>
            {searchQuery && (
              <>
                <span style={{ color: "var(--muted-foreground)" }}>/</span>
                <span style={{ color: "var(--foreground)", fontWeight: 500 }}>"{searchQuery}"</span>
              </>
            )}
          </div>
          {searchQuery && (
            <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-4">
              Results for "{searchQuery}"
            </h1>
          )}
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <button
            className="filter-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filter and Sort
            {activeFilters > 0 && (
              <span className="ml-1 w-5 h-5 bg-foreground text-background rounded-full text-[10px] flex items-center justify-center font-bold">
                {activeFilters}
              </span>
            )}
          </button>

          <div className="flex items-center gap-6">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-transparent text-xs font-semibold tracking-wider uppercase text-foreground pr-6 cursor-pointer focus:outline-none"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ChevronDown className="w-3 h-3 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
            </div>
            <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
              {sorted.length} Products
            </span>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="py-6 border-b border-border grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Category */}
                <div>
                  <h3 className="text-xs font-bold tracking-widest uppercase mb-3 text-foreground">Category</h3>
                  <div className="space-y-1">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        className={`block w-full text-left text-sm py-1.5 px-2 transition-colors ${
                          category === cat.value
                            ? "text-foreground font-semibold bg-muted"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-xs font-bold tracking-widest uppercase mb-3 text-foreground">Price Range</h3>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={50000}
                    step={100}
                    className="mb-3"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground font-medium">
                    <span>₹{priceRange[0].toLocaleString()}</span>
                    <span>₹{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>

                {/* Size */}
                <div>
                  <h3 className="text-xs font-bold tracking-widest uppercase mb-3 text-foreground">Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                        className={`text-xs px-3 py-1.5 font-semibold transition-all border ${
                          selectedSize === size
                            ? "bg-foreground text-background border-foreground"
                            : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active filters chips */}
              {activeFilters > 0 && (
                <div className="flex items-center gap-2 py-3 flex-wrap">
                  <span className="text-xs text-muted-foreground font-medium">Active:</span>
                  {category !== "all" && (
                    <button
                      onClick={() => setCategory("all")}
                      className="text-xs px-2.5 py-1 border border-border flex items-center gap-1 hover:bg-muted transition-colors"
                    >
                      {CATEGORIES.find(c => c.value === category)?.label}
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {selectedSize && (
                    <button
                      onClick={() => setSelectedSize(null)}
                      className="text-xs px-2.5 py-1 border border-border flex items-center gap-1 hover:bg-muted transition-colors"
                    >
                      Size: {selectedSize}
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {(priceRange[0] > 0 || priceRange[1] < 50000) && (
                    <button
                      onClick={() => setPriceRange([0, 50000])}
                      className="text-xs px-2.5 py-1 border border-border flex items-center gap-1 hover:bg-muted transition-colors"
                    >
                      ₹{priceRange[0].toLocaleString()} – ₹{priceRange[1].toLocaleString()}
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => { setCategory("all"); setSelectedSize(null); setPriceRange([0, 50000]); }}
                    className="text-xs text-muted-foreground underline hover:text-foreground ml-2"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        <div className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-sm">No products found with these filters.</p>
              <button
                onClick={() => { setCategory("all"); setSelectedSize(null); setPriceRange([0, 50000]); }}
                className="text-sm text-foreground underline mt-2 hover:opacity-70"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-16">
              {sorted.map((product: any, i: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                >
                  <Link href={`/product/${product.slug}`}>
                    <div className="product-card group cursor-pointer">
                      <div className="product-image relative">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0].imageUrl}
                            alt={product.name}
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <span className="text-4xl font-black text-muted-foreground/20">{product.name[0]}</span>
                          </div>
                        )}

                        {/* Low stock badge */}
                        {product.stock <= 5 && product.stock > 0 && (
                          <div className="absolute top-3 left-3 save-badge">
                            LOW STOCK
                          </div>
                        )}

                        {/* Sold out */}
                        {product.stock === 0 && (
                          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                            <span className="text-xs font-bold tracking-widest uppercase text-foreground">Sold Out</span>
                          </div>
                        )}

                        {/* Wishlist */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(product.id);
                          }}
                          className={`wishlist-btn absolute top-3 right-3 ${wishlisted.has(product.id) ? "active" : ""}`}
                        >
                          <Heart className="w-4 h-4" fill={wishlisted.has(product.id) ? "currentColor" : "none"} />
                        </button>

                        {/* Quick add */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                            Quick Add
                          </button>
                        </div>
                      </div>

                      <div className="product-info">
                        <p className="product-name">{product.name}</p>
                        <p className="product-price">₹{product.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </StorefrontLayout>
  );
}
