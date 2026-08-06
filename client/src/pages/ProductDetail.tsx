import { trpc } from "@/lib/trpc";
import StorefrontLayout from "@/components/StorefrontLayout";
import { useCart } from "@/contexts/CartContext";
import { useParams, useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, ShoppingCart, Truck, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const { data: product, isLoading } = trpc.products.bySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  if (isLoading) {
    return (
      <StorefrontLayout>
        <div className="container py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-[3/4] bg-muted animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 w-64 bg-muted animate-pulse" />
              <div className="h-6 w-32 bg-muted animate-pulse" />
              <div className="h-32 w-full bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  if (!product) {
    return (
      <StorefrontLayout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-black mb-4">Product not found</h1>
          <Button onClick={() => setLocation("/shop")} variant="outline">Back to Shop</Button>
        </div>
      </StorefrontLayout>
    );
  }

  const images = product.images?.map(img => img.imageUrl) || [];
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      quantity: 1,
      imageUrl: images[0],
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <StorefrontLayout>
      <div className="container py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-3"
          >
            {images.length > 0 ? (
              <>
                <div className="aspect-[3/4] overflow-hidden border border-border bg-muted group">
                  <motion.img
                    key={selectedImageIndex}
                    src={images[selectedImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImageIndex(i)}
                        className={`w-16 h-16 overflow-hidden border-2 flex-shrink-0 transition-all ${
                          selectedImageIndex === i ? "border-foreground" : "border-transparent hover:border-muted-foreground"
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-[3/4] border border-border bg-muted flex items-center justify-center">
                <span className="text-6xl font-black text-muted-foreground/20">{product.name[0]}</span>
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-6"
          >
            <div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1 font-medium">
                {product.category}
              </p>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">{product.name}</h1>
              <p className="text-xl font-bold mt-2">₹{product.price.toLocaleString()}</p>
            </div>

            {/* Stock badges */}
            {isOutOfStock && (
              <div className="inline-block px-3 py-1 text-xs font-bold tracking-wider uppercase bg-muted text-muted-foreground">
                Sold Out
              </div>
            )}
            {isLowStock && (
              <div className="inline-block save-badge">
                Only {product.stock} left!
              </div>
            )}

            {/* Description */}
            {product.description && (
              <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
            )}

            {/* Size Selector */}
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-3">Size</p>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 font-semibold text-sm transition-all border ${
                      selectedSize === size
                        ? "bg-foreground text-background border-foreground"
                        : "border-border hover:border-foreground text-foreground"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {!selectedSize && (
                <p className="text-xs text-muted-foreground mt-2">Select a size to add to cart</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={!selectedSize || isOutOfStock}
                className={`flex-1 py-6 text-sm font-bold tracking-widest uppercase gap-2 ${
                  addedToCart
                    ? "bg-green-600 hover:bg-green-600 text-white"
                    : !selectedSize || isOutOfStock
                      ? ""
                      : "bg-foreground text-background hover:opacity-90"
                }`}
                size="lg"
              >
                {addedToCart ? (
                  <>Added to Cart ✓</>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    {isOutOfStock ? "Sold Out" : selectedSize ? "Add to Cart" : "Select a Size"}
                  </>
                )}
              </Button>

              <button
                onClick={() => setWishlisted(!wishlisted)}
                className={`w-14 h-14 flex items-center justify-center border transition-colors ${
                  wishlisted
                    ? "border-red-500 text-red-500 bg-red-50"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
                aria-label="Add to wishlist"
              >
                <Heart className="w-5 h-5" fill={wishlisted ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Shipping info */}
            <div className="space-y-3 border-t border-border pt-6">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Truck className="w-4 h-4 flex-shrink-0" />
                <span>Free shipping on orders above ₹999</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Share2 className="w-4 h-4 flex-shrink-0" />
                <span>Easy returns & exchanges within 7 days</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
