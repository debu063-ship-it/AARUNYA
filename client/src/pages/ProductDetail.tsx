import { trpc } from "@/lib/trpc";
import StorefrontLayout from "@/components/StorefrontLayout";
import { useCart } from "@/contexts/CartContext";
import { useParams, useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart, Truck, Heart, Share2, Clock, MapPin, CheckCircle2, AlertCircle, Loader2, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SizeChartModal } from "@/components/SizeChartModal";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [pincodeInput, setPincodeInput] = useState("");
  const [checkedPincode, setCheckedPincode] = useState("");
  const [sizeChartOpen, setSizeChartOpen] = useState(false);

  const pincodeQuery = trpc.orders.checkPincode.useQuery(
    { pincode: checkedPincode },
    { enabled: checkedPincode.length === 6 }
  );

  const { data: product, isLoading } = trpc.products.bySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  // Auto-select size if product has only 1 available size
  useEffect(() => {
    if (product && (product as any).sizes && Array.isArray((product as any).sizes) && (product as any).sizes.length === 1) {
      setSelectedSize((product as any).sizes[0]);
    }
  }, [product]);

  // Auto-select color if product has only 1 available color
  useEffect(() => {
    if (product && (product as any).colors && Array.isArray((product as any).colors) && (product as any).colors.length === 1) {
      setSelectedColor((product as any).colors[0]);
    }
  }, [product]);

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

  const images = (product.images ?? []).map((img: { imageUrl: string }) => img.imageUrl);
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const productColors: { name: string; hex: string }[] = (product as any).colors && Array.isArray((product as any).colors) ? (product as any).colors : [];
  const hasColors = productColors.length > 0;

  const handleAddToCart = () => {
    if (!selectedSize) return;
    if (hasColors && !selectedColor) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: selectedColor?.name,
      colorHex: selectedColor?.hex,
      quantity: 1,
      imageUrl: images[0],
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const isAddDisabled = !selectedSize || (hasColors && !selectedColor) || isOutOfStock;

  const getAddButtonText = () => {
    if (isOutOfStock) return "Sold Out";
    if (hasColors && !selectedColor) return "Select a Colour";
    if (!selectedSize) return "Select a Size";
    return "Add to Cart";
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
                    {images.map((img: string, i: number) => (
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

            {/* Colour Selector (if available) */}
            {hasColors && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold tracking-widest uppercase">Colour</p>
                  {selectedColor && (
                    <span className="text-xs font-medium text-muted-foreground">
                      Selected: <strong className="text-foreground">{selectedColor.name}</strong>
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {productColors.map((c) => {
                    const isSelected = selectedColor?.name === c.name;
                    return (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c)}
                        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-foreground text-background border-foreground shadow-sm scale-105"
                            : "border-border hover:border-foreground/60 text-foreground bg-background"
                        }`}
                        title={c.name}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-black/20 shadow-2xs flex-shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
                {!selectedColor && (
                  <p className="text-xs text-muted-foreground mt-2">Select a colour to add to cart</p>
                )}
              </div>
            )}

            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold tracking-widest uppercase">Size</p>
                  {selectedSize && (
                    <span className="text-xs font-medium text-muted-foreground">
                      · Selected: <strong className="text-foreground">{selectedSize}</strong>
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSizeChartOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors py-1 px-2.5 rounded-lg bg-primary/10 hover:bg-primary/15 cursor-pointer shadow-2xs"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Chart</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {((product as any).sizes && Array.isArray((product as any).sizes) && (product as any).sizes.length > 0
                  ? (product as any).sizes
                  : SIZES
                ).map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[48px] px-3.5 h-12 font-semibold text-sm transition-all border rounded-lg cursor-pointer ${
                      selectedSize === size
                        ? "genz-gradient-bg text-primary-foreground border-transparent shadow-sm scale-105"
                        : "border-border hover:border-foreground text-foreground bg-background"
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
                disabled={isAddDisabled}
                className={`flex-1 py-6 text-sm font-bold tracking-widest uppercase gap-2 ${
                  addedToCart
                    ? "bg-green-600 hover:bg-green-600 text-white"
                    : isAddDisabled
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
                    {getAddButtonText()}
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

            {/* Delhivery Express Pincode & Delivery Checker */}
            <div className="border border-border/70 bg-card rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                  <Truck className="w-4 h-4 text-primary" />
                  <span>Delhivery Express Delivery</span>
                </div>
                <span className="text-[11px] font-semibold text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                  Free over ₹999
                </span>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const clean = pincodeInput.trim().replace(/\D/g, "");
                  if (clean.length === 6) {
                    setCheckedPincode(clean);
                  }
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    maxLength={6}
                    value={pincodeInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setPincodeInput(val);
                      if (val.length === 6) {
                        setCheckedPincode(val);
                      }
                    }}
                    placeholder="Enter 6-digit Pincode"
                    className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={pincodeInput.length !== 6 || pincodeQuery.isLoading}
                  className="rounded-xl text-xs font-bold px-3.5 h-9"
                >
                  {pincodeQuery.isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Check"}
                </Button>
              </form>

              {checkedPincode && (
                <div className="pt-1 text-xs">
                  {pincodeQuery.isLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking Delhivery serviceability...
                    </div>
                  ) : pincodeQuery.data?.serviceable ? (
                    <div className="space-y-1.5 bg-green-500/5 border border-green-500/20 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span>Serviceable for {pincodeQuery.data.city ? `${pincodeQuery.data.city}, ` : ""}{checkedPincode}</span>
                      </div>
                      <p className="text-muted-foreground text-[11px] pl-6">
                        Estimated delivery by <strong>{pincodeQuery.data.expectedDeliveryDate}</strong> via Delhivery Express.
                      </p>
                    </div>
                  ) : pincodeQuery.data && !pincodeQuery.data.serviceable ? (
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>Delivery not currently serviceable to {checkedPincode}.</span>
                    </div>
                  ) : null}
                </div>
              )}

              <div className="pt-2 border-t border-border/50 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-3.5 h-3.5 text-foreground/70 flex-shrink-0" />
                  <span>Dispatched in 1–2 business days</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Share2 className="w-3.5 h-3.5 text-foreground/70 flex-shrink-0" />
                  <span>Strict 24-hr return & exchange window</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Interactive Size Chart & Measurement Guide Modal */}
      <SizeChartModal
        open={sizeChartOpen}
        onOpenChange={setSizeChartOpen}
        productName={product.name}
        category={product.category}
        sizeChartUrl={(product as any).sizeChartUrl}
        availableSizes={(product as any).sizes || SIZES}
      />
    </StorefrontLayout>
  );
}
