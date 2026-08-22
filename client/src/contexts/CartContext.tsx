import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { toast } from "sonner";

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  size: string;
  color?: string;
  colorHex?: string;
  quantity: number;
  imageUrl?: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, size: string, color?: string) => void;
  updateQuantity: (productId: number, size: string, quantity: number, color?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "slaypop_cart";

const isSameItem = (a: { productId: number; size: string; color?: string }, b: { productId: number; size: string; color?: string }) =>
  a.productId === b.productId && a.size === b.size && (a.color || "") === (b.color || "");

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => isSameItem(i, item));
      if (existing) {
        toast.success(`Updated quantity for ${item.name}`);
        return prev.map(i =>
          isSameItem(i, item)
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      toast.success(`Added ${item.name} to cart`);
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((productId: number, size: string, color?: string) => {
    setItems(prev => prev.filter(i => !isSameItem(i, { productId, size, color })));
    toast.success("Item removed from cart");
  }, []);

  const updateQuantity = useCallback((productId: number, size: string, quantity: number, color?: string) => {
    if (quantity <= 0) {
      removeItem(productId, size, color);
      return;
    }
    setItems(prev =>
      prev.map(i =>
        isSameItem(i, { productId, size, color }) ? { ...i, quantity } : i
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
