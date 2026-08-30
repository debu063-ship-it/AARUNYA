import StorefrontLayout from "@/components/StorefrontLayout";
import { useWishlist, WishlistItem } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles, Check, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

function WishlistCard({ item, index }: { item: WishlistItem; index: number }) {
  const { removeFromWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleMoveToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: item.productId,
      name: item.name,
      price: item.price,
      size: "M",
      quantity: 1,
      imageUrl: item.imageUrl,
    });
    toast.success(`Moved ${item.name} (Size M) to your cart!`);
  };

  const isOutOfStock = item.stock === 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="group relative bg-card border border-border/60 rounded-2xl overflow-hidden flex flex-col shadow-xs hover:shadow-md transition-all duration-300"
    >
      {/* Image container */}
      <div className="relative aspect-[3/4] bg-muted overflow-hidden">
        <Link href={`/product/${item.slug || item.productId}`}>
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-4xl font-black text-muted-foreground/20">{item.name[0]}</span>
            </div>
          )}
        </Link>

        {/* Stock Badge */}
        {isOutOfStock ? (
          <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Sold Out
          </div>
        ) : item.stock && item.stock <= 5 ? (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
            Only {item.stock} left
          </div>
        ) : (
          <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white/90 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
            In Stock
          </div>
        )}

        {/* Remove Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            removeFromWishlist(item.productId);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-md text-red-500 hover:text-red-600 hover:bg-white dark:hover:bg-black flex items-center justify-center shadow-xs transition-transform hover:scale-110"
          aria-label="Remove from wishlist"
          title="Remove from wishlist"
        >
          <Heart className="w-4 h-4 fill-red-500 text-red-500" />
        </button>
      </div>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {item.category && (
            <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase mb-1">
              {item.category}
            </p>
          )}
          <Link href={`/product/${item.slug || item.productId}`}>
            <h3 className="font-bold text-sm tracking-tight text-foreground hover:text-primary transition-colors line-clamp-1">
              {item.name}
            </h3>
          </Link>

          <div className="flex items-center gap-2 mt-2">
            <span className="font-extrabold text-base text-foreground">
              ₹{item.price.toLocaleString()}
            </span>
            {item.originalPrice && item.originalPrice > item.price && (
              <>
                <span className="text-xs text-muted-foreground line-through">
                  ₹{item.originalPrice.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">
                  {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                </span>
              </>
            )}
          </div>
        </div>

        {/* Quick Add to Cart Button */}
        <div className="mt-4 pt-3 border-t border-border/50">
          <Button
            onClick={handleMoveToCart}
            disabled={isOutOfStock}
            className="w-full h-10 text-xs font-bold uppercase tracking-wider gap-1.5 rounded-xl transition-all"
            variant={isOutOfStock ? "outline" : "default"}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {isOutOfStock ? "Out of Stock" : "Move to Cart"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Wishlist() {
  const { items, clearWishlist, totalWishlistItems } = useWishlist();
  const { addItem } = useCart();

  // Fetch trending products to display when wishlist is empty
  const { data: trendingData } = trpc.products.list.useQuery(
    { page: 1, limit: 4, sort: "newest" },
    { enabled: items.length === 0 }
  );

  const handleMoveAllToCart = () => {
    const inStockItems = items.filter((i) => i.stock === undefined || i.stock > 0);
    if (inStockItems.length === 0) {
      toast.error("No in-stock items to add");
      return;
    }

    inStockItems.forEach((item) => {
      addItem({
        productId: item.productId,
        name: item.name,
        price: item.price,
        size: "M",
        quantity: 1,
        imageUrl: item.imageUrl,
      });
    });

    toast.success(`Added ${inStockItems.length} items to your cart!`);
  };

  return (
    <StorefrontLayout>
      <div className="container py-8 md:py-12">
        {/* Breadcrumb */}
        <div className="breadcrumb mb-6 text-xs text-muted-foreground flex items-center gap-2">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <span className="text-foreground font-semibold">Wishlist</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border/60 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                My Wishlist
              </h1>
              <span className="bg-primary/10 text-primary text-sm font-bold px-3 py-1 rounded-full">
                {totalWishlistItems} {totalWishlistItems === 1 ? "item" : "items"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1.5">
              Saved pieces you love. Move them to your bag before they sell out.
            </p>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={clearWishlist}
                className="text-xs font-semibold rounded-xl text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Clear All
              </Button>
              <Button
                size="sm"
                onClick={handleMoveAllToCart}
                className="text-xs font-bold uppercase tracking-wider rounded-xl gap-1.5 shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Add All to Cart
              </Button>
            </div>
          )}
        </div>

        {/* Main Content */}
        {items.length === 0 ? (
          <div className="py-12 text-center max-w-lg mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="relative mx-auto w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <Heart className="w-12 h-12 fill-red-500/20" />
                <Sparkles className="w-5 h-5 absolute -top-1 -right-1 text-primary animate-bounce" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-foreground">
                  Your Wishlist is Empty
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You haven't saved any items yet. Browse our latest drops and tap the heart icon on your favorite streetwear designs to save them here.
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <Link href="/shop">
                  <Button className="px-8 py-6 rounded-full font-bold uppercase tracking-wider text-xs gap-2 shadow-lg">
                    Explore Drops <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Trending Recommendations */}
            {trendingData?.products && trendingData.products.length > 0 && (
              <div className="mt-16 pt-12 border-t border-border/50 text-left">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-foreground">
                      Popular Right Now
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Check out what everyone's raving about
                    </p>
                  </div>
                  <Link href="/shop" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                    View All <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {trendingData.products.slice(0, 4).map((p: any) => (
                    <Link key={p.id} href={`/product/${p.slug}`}>
                      <div className="group cursor-pointer bg-card border border-border/50 rounded-xl overflow-hidden p-2 hover:shadow-md transition-all">
                        <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden mb-2 relative">
                          {p.images?.[0]?.imageUrl ? (
                            <img
                              src={p.images[0].imageUrl}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-2xl font-bold text-muted-foreground/30">{p.name[0]}</span>
                            </div>
                          )}
                        </div>
                        <h4 className="font-bold text-xs truncate text-foreground group-hover:text-primary transition-colors">
                          {p.name}
                        </h4>
                        <p className="font-black text-xs text-foreground mt-0.5">
                          ₹{p.price.toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            <AnimatePresence>
              {items.map((item, index) => (
                <WishlistCard key={item.productId} item={item} index={index} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
}
