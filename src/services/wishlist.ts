import { api } from "./api";

export interface WishlistEntry {
  _id: string;
  addedAt: string;
  product: {
    _id: string;
    title: string;
    price: number;
    image: string;
    slug: string;
  };
}

export const fetchWishlist = () =>
  api<{ items: WishlistEntry[] }>("/api/wishlist/list").then((r) => r.items);

export const toggleWishlist = (productId: string) =>
  api<{ inWishlist: boolean }>("/api/wishlist/toggle", {
    method: "POST",
    body: JSON.stringify({ productId }),
  });
