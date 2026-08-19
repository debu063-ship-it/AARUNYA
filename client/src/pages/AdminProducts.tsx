import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useState, useRef } from "react";
import { Trash2, Edit2, Plus, Upload, X, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { value: "tops", label: "Tops" },
  { value: "bottoms", label: "Bottoms" },
  { value: "outerwear", label: "Outerwear" },
  { value: "accessories", label: "Accessories" },
  { value: "co-ords", label: "Co-ords" },
];

const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size", "One Size"];

export default function AdminProducts() {
  const [location, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [customSizeInput, setCustomSizeInput] = useState("");
  type ProductFormData = {
    name: string;
    description: string;
    category: "tops" | "bottoms" | "outerwear" | "accessories" | "co-ords";
    price: number;
    stock: number;
    sizes: string[];
    images: { url: string; key: string }[];
  };
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    category: "tops",
    price: 0,
    stock: 0,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    images: [],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inline stock editing
  const [editingStockId, setEditingStockId] = useState<number | null>(null);
  const [editingStockValue, setEditingStockValue] = useState<string>("");

  const { data: products, isLoading, refetch } = trpc.adminProducts.list.useQuery(undefined, { staleTime: 5000 });
  const utils = trpc.useUtils();

  const createMutation = trpc.adminProducts.create.useMutation({
    onSuccess: () => {
      toast.success("Product created");
      resetForm();
      utils.adminProducts.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.adminProducts.update.useMutation({
    onSuccess: () => {
      toast.success("Product updated");
      resetForm();
      utils.adminProducts.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.adminProducts.delete.useMutation({
    onSuccess: () => {
      toast.success("Product deleted");
      utils.adminProducts.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const uploadMutation = trpc.adminProducts.uploadImage.useMutation({
    onSuccess: (data) => {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, { url: data.url, key: data.key }],
      }));
      toast.success("Image uploaded");
    },
    onError: (err) => toast.error("Upload failed: " + err.message),
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadMutation.mutate({ file: base64, filename: file.name });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setCustomSizeInput("");
    setFormData({ name: "", description: "", category: "tops", price: 0, stock: 0, sizes: ["XS", "S", "M", "L", "XL", "XXL"], images: [] });
  };

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setCustomSizeInput("");
    setFormData({
      name: product.name,
      description: product.description || "",
      category: product.category,
      price: product.price,
      stock: product.stock,
      sizes: product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : ["XS", "S", "M", "L", "XL", "XXL"],
      images: product.images?.map((img: any) => ({ url: img.imageUrl, key: img.imageKey })) || [],
    });
    setShowForm(true);
  };

  const toggleSize = (size: string) => {
    setFormData(prev => {
      const exists = prev.sizes.includes(size);
      if (exists) {
        return { ...prev, sizes: prev.sizes.filter(s => s !== size) };
      } else {
        return { ...prev, sizes: [...prev.sizes, size] };
      }
    });
  };

  const addCustomSize = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = customSizeInput.trim();
    if (!clean) return;
    if (!formData.sizes.includes(clean)) {
      setFormData(prev => ({ ...prev, sizes: [...prev.sizes, clean] }));
    }
    setCustomSizeInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.sizes.length === 0) {
      toast.error("Please select at least one available size");
      return;
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleInlineStockSave = (product: any) => {
    const newStock = parseInt(editingStockValue, 10);
    if (isNaN(newStock) || newStock < 0) {
      toast.error("Invalid stock value");
      return;
    }
    updateMutation.mutate({
      id: product.id,
      name: product.name,
      description: product.description || "",
      category: product.category,
      price: product.price,
      stock: newStock,
      sizes: product.sizes || ["XS", "S", "M", "L", "XL", "XXL"],
      images: product.images?.map((img: any) => ({ url: img.imageUrl, key: img.imageKey })) || [],
    });
    setEditingStockId(null);
  };

  if (isLoading) return <div className="p-6"><div className="animate-pulse h-8 w-48 bg-muted rounded-xl mb-6" /></div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black tracking-tight">Products</h1>
        <Button onClick={() => setShowForm(true)} className="gap-2 genz-gradient-bg text-primary-foreground border-0 rounded-xl font-bold hover:opacity-90 shadow-sm">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="border border-border/50 rounded-2xl p-6 mb-6 bg-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black">{editingId ? "Edit Product" : "New Product"}</h2>
                <Button type="button" variant="ghost" size="sm" onClick={resetForm} className="rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-wider">Product Name *</Label>
                  <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Oversized Tee" required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-wider">Category *</Label>
                  <Select value={formData.category} onValueChange={(v: "tops" | "bottoms" | "outerwear" | "accessories" | "co-ords") => setFormData(p => ({ ...p, category: v }))}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-wider">Price (₹) *</Label>
                  <Input type="number" value={formData.price || ""} onChange={e => setFormData(p => ({ ...p, price: Number(e.target.value) }))} placeholder="999" required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-wider">Stock *</Label>
                  <Input type="number" value={formData.stock || ""} onChange={e => setFormData(p => ({ ...p, stock: Number(e.target.value) }))} placeholder="50" required className="rounded-xl" />
                </div>

                {/* Available Sizes Section */}
                <div className="md:col-span-2 space-y-2.5 p-4 rounded-xl bg-muted/40 border border-border/40">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                      <span>Available Sizes *</span>
                      <span className="text-[11px] font-normal text-muted-foreground">({formData.sizes.length} selected)</span>
                    </Label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, sizes: ["XS", "S", "M", "L", "XL", "XXL"] }))}
                        className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                      >
                        Standard (XS-XXL)
                      </button>
                      <span className="text-muted-foreground text-xs">·</span>
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, sizes: ["Free Size"] }))}
                        className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                      >
                        Free Size
                      </button>
                      <span className="text-muted-foreground text-xs">·</span>
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, sizes: [] }))}
                        className="text-[11px] font-medium text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Standard size chips */}
                  <div className="flex flex-wrap gap-2">
                    {STANDARD_SIZES.map(s => {
                      const isSelected = formData.sizes.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSize(s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                            isSelected
                              ? "genz-gradient-bg text-primary-foreground border-transparent shadow-sm scale-105"
                              : "bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom size input */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                    <Input
                      value={customSizeInput}
                      onChange={e => setCustomSizeInput(e.target.value)}
                      placeholder="Add custom size (e.g. 28, 30, UK 8, etc.)"
                      className="rounded-lg h-8 text-xs max-w-xs"
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomSize();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addCustomSize()}
                      className="h-8 text-xs font-bold rounded-lg"
                    >
                      + Add Size
                    </Button>
                  </div>

                  {/* Selected size summary tags */}
                  {formData.sizes.filter(s => !STANDARD_SIZES.includes(s)).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[11px] text-muted-foreground self-center">Custom sizes:</span>
                      {formData.sizes.filter(s => !STANDARD_SIZES.includes(s)).map(s => (
                        <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold genz-gradient-bg text-primary-foreground">
                          {s}
                          <button type="button" onClick={() => toggleSize(s)} className="hover:text-red-200">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-wider">Description</Label>
                  <Textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Product description..." rows={3} className="rounded-xl" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-wider">Images</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.images.map((img, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border/50">
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setFormData(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))} className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center">
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="w-20 h-20 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-primary transition-colors">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="genz-gradient-bg text-primary-foreground border-0 rounded-xl font-bold hover:opacity-90">
                  {editingId ? "Update" : "Create"} Product
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {products?.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No products yet. Add your first product to get started</p>
        </div>
      )}

      <div className="grid gap-3">
        {products?.map((product: any, i: number) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="border border-border/50 rounded-xl p-4 flex items-center gap-4 bg-card genz-card-hover"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
              {product.images?.[0] ? (
                <img src={product.images[0].imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-muted-foreground" /></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold truncate">{product.name}</h3>
              <p className="text-sm text-muted-foreground">
                {product.category} · ₹{(product.price).toLocaleString()}
              </p>
              {/* Size badges in list */}
              <div className="flex flex-wrap gap-1 mt-1">
                {(product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : ["XS", "S", "M", "L", "XL", "XXL"]).map((sz: string) => (
                  <span key={sz} className="inline-block px-1.5 py-0.2 bg-muted text-[10px] font-bold rounded text-muted-foreground border border-border/40">
                    {sz}
                  </span>
                ))}
              </div>
              {/* Inline stock editing */}
              {editingStockId === product.id ? (
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    value={editingStockValue}
                    onChange={e => setEditingStockValue(e.target.value)}
                    className="w-20 h-7 text-xs rounded-lg"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === "Enter") handleInlineStockSave(product);
                      if (e.key === "Escape") setEditingStockId(null);
                    }}
                  />
                  <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => handleInlineStockSave(product)}>Save</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => setEditingStockId(null)}>Cancel</Button>
                </div>
              ) : (
                <button
                  onClick={() => { setEditingStockId(product.id); setEditingStockValue(String(product.stock)); }}
                  className={`text-xs mt-0.5 font-bold cursor-pointer hover:underline ${product.stock <= 5 ? "text-red-500" : "text-green-600 dark:text-green-400"}`}
                  title="Click to edit stock"
                >
                  {product.stock <= 5 ? `Low stock: ${product.stock} left` : `${product.stock} in stock`}
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(product)} className="rounded-xl">
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="destructive" size="sm" onClick={() => { if (confirm("Delete this product?")) deleteMutation.mutate({ id: product.id }); }} className="rounded-xl">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
