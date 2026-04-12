/**
 * Presentation type used by Cart, Wishlist, ProductCard, etc.
 * Adapter in src/hooks/useProducts.ts maps Sanity products into this shape.
 * NOTE: this file holds NO data — only the type contract.
 */
export interface Product {
  id: string;
  name: string;
  price: number;
  priceFormatted: string;
  image: string;
  images?: string[];
  category: string;
  subcategory?: string;
  isNew: boolean;
  description: string;
  sizes: string[];
  colors: string[];
  fabric?: string;
  occasion?: string;
  season?: string;
  fit?: string;
  type?: "stitched" | "unstitched";
  wearType?: "eastern" | "western";
  slug?: string;
  stock?: number;
}
