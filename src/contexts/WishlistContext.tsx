import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Product } from "@/types/product";
import { useAuth } from "@/contexts/AuthContext";
import { fetchWishlist, toggleWishlist as apiToggle } from "@/services/wishlist";
import { formatPrice } from "@/lib/currency";

interface WishlistContextType {
  items: Product[];
  loading: boolean;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<Product[]>(() => {
    const saved = localStorage.getItem("maison-wishlist");
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);

  const save = (newItems: Product[]) => {
    setItems(newItems);
    localStorage.setItem("maison-wishlist", JSON.stringify(newItems));
  };

  // When the user logs in, hydrate from Sanity (server is source of truth)
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchWishlist()
      .then((rows) => {
        const adapted: Product[] = rows.map((r) => ({
          id: r.product._id,
          name: r.product.title,
          price: r.product.price,
          priceFormatted: formatPrice(r.product.price),
          image: r.product.image,
          category: "",
          isNew: false,
          description: "",
          sizes: [],
          colors: [],
        } as unknown as Product));
        save(adapted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const addItem = (product: Product) => {
    if (!items.find((i) => i.id === product.id)) {
      save([...items, product]);
    }
    if (user) apiToggle(product.id).catch(() => {});
  };

  const removeItem = (productId: string) => {
    save(items.filter((i) => i.id !== productId));
    if (user) apiToggle(productId).catch(() => {});
  };

  const toggleItem = (product: Product) => {
    if (items.find((i) => i.id === product.id)) {
      save(items.filter((i) => i.id !== product.id));
    } else {
      save([...items, product]);
    }
    if (user) apiToggle(product.id).catch(() => {});
  };

  const isInWishlist = (productId: string) => !!items.find((i) => i.id === productId);

  return (
    <WishlistContext.Provider value={{ items, loading, addItem, removeItem, toggleItem, isInWishlist, totalItems: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};
