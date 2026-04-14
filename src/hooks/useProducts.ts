import { useEffect, useState } from "react";
import { Product } from "@/types/product";
import { sanityClient } from "@/lib/sanity";
import { formatPrice } from "@/lib/currency";

/**
 * Sanity-only product hook. NO fallback data.
 * Empty Sanity → empty array (UI shows "No content yet" or skeleton).
 */
const PROJECTION = `{
  _id,
  title,
  "slug": slug.current,
  price,
  priceFormatted,
  "image": images[0].asset->url,
  "images": images[].asset->url,
  description,
  "categoryLabel": coalesce(category->title, ""),
  "subcategory": category->subcategory,
  wearType,
  type,
  fabric,
  occasion,
  season,
  fit,
  sizes,
  "color": color->name,
  stock,
  featured,
  isNew
}`;

interface SanityProductRow {
  _id: string;
  title: string;
  slug: string;
  price: number;
  priceFormatted?: string;
  image: string;
  images?: string[];
  description?: string;
  categoryLabel?: string;
  subcategory?: string;
  wearType?: "western" | "eastern";
  type?: "stitched" | "unstitched";
  fabric?: string;
  occasion?: string;
  season?: string;
  fit?: string;
  sizes?: string[];
  color?: string;
  stock?: number;
  featured?: boolean;
  isNew?: boolean;
}

function adapt(p: SanityProductRow): Product {
  return {
    id: p._id,
    name: p.title,
    price: p.price,
    priceFormatted: formatPrice(p.price ?? 0),
    image: p.image || "",
    images: p.images,
    category: p.categoryLabel || "",
    subcategory: p.subcategory,
    isNew: !!p.isNew,
    description: p.description || "",
    sizes: p.sizes || [],
    colors: p.color ? [p.color] : [],
    fabric: p.fabric,
    occasion: p.occasion,
    season: p.season,
    fit: p.fit,
    type: p.type,
    wearType: p.wearType,
    slug: p.slug,
    stock: p.stock,
  };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    sanityClient
      .fetch<SanityProductRow[]>(`*[_type=="product"] | order(_createdAt desc) ${PROJECTION}`, {}, { useCdn: false })
      .then((rows) => mounted && setProducts((rows || []).map(adapt)))
      .catch((e) => mounted && setError(e as Error))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return { products, loading, error };
}
