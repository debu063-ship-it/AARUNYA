import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { toast } from "sonner";

export type WishlistItem = {
  productId: number;
  name: string;
  slug?: string;
  price: number;
  originalPrice?: number | null;
  imageUrl?: string;
  category?: string;
  stock?: number;
};

type WishlistContextType = {
  items: WishlistItem[];
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (item: WishlistItem) => void;
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (productId: number) => void;
  clearWishlist: () => void;
  totalWishlistItems: number;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

const STORAGE_KEY = "slaypop_wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save wishlist to localStorage", e);
    }
  }, [items]);

  const isInWishlist = useCallback(
    (productId: number) => items.some(i => i.productId === productId),
    [items]
  );

  const addToWishlist = useCallback((item: WishlistItem) => {
    setItems(prev => {
      if (prev.some(i => i.productId === item.productId)) {
        return prev;
      }
      toast.success(`Added ${item.name} to wishlist ❤️`, {
        action: {
          label: "View Wishlist",
          onClick: () => {
            window.location.href = "/wishlist";
          },
        },
      });
      return [...prev, item];
    });
  }, []);

  const removeFromWishlist = useCallback((productId: number) => {
    setItems(prev => {
      const target = prev.find(i => i.productId === productId);
      if (target) {
        toast.info(`Removed ${target.name} from wishlist`);
      }
      return prev.filter(i => i.productId !== productId);
    });
  }, []);

  const toggleWishlist = useCallback((item: WishlistItem) => {
    setItems(prev => {
      const exists = prev.some(i => i.productId === item.productId);
      if (exists) {
        toast.info(`Removed ${item.name} from wishlist`);
        return prev.filter(i => i.productId !== item.productId);
      } else {
        toast.success(`Added ${item.name} to wishlist ❤️`, {
          action: {
            label: "View Wishlist",
            onClick: () => {
              window.location.href = "/wishlist";
            },
          },
        });
        return [...prev, item];
      }
    });
  }, []);

  const clearWishlist = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    toast.info("Wishlist cleared");
  }, []);

  const totalWishlistItems = items.length;

  return (
    <WishlistContext.Provider
      value={{
        items,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        totalWishlistItems,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
