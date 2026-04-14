import { sanityClient, urlFor } from "@/lib/sanity";

export interface SanityProduct {
  _id: string;
  title: string;
  slug: string;
  price: number;
  image: string;
  images?: string[];
  description?: string;
  category?: string;
  subcategory?: string;
  stock?: number;
  featured?: boolean;
  isNew?: boolean;
  sizes?: string[];
  colors?: string[];
}

const PROJECTION = `{
  _id,
  title,
  "slug": slug.current,
  price,
  "image": images[0].asset->url,
  "images": images[].asset->url,
  description,
  category,
  "subcategory": category->subcategory,
  stock,
  featured,
  isNew,
  sizes,
  colors
}`;

export async function fetchProducts(): Promise<SanityProduct[]> {
  return sanityClient.fetch(`*[_type=="product"] | order(_createdAt desc) ${PROJECTION}`);
}

export async function fetchFeaturedProducts(limit = 8): Promise<SanityProduct[]> {
  return sanityClient.fetch(
    `*[_type=="product" && featured==true] | order(_createdAt desc) [0...$limit] ${PROJECTION}`,
    { limit }
  );
}

export async function fetchNewArrivals(limit = 8): Promise<SanityProduct[]> {
  return sanityClient.fetch(
    `*[_type=="product" && isNew==true] | order(_createdAt desc) [0...$limit] ${PROJECTION}`,
    { limit }
  );
}

export async function fetchProductById(id: string): Promise<SanityProduct | null> {
  return sanityClient.fetch(`*[_type=="product" && _id==$id][0] ${PROJECTION}`, { id });
}

export { urlFor };
