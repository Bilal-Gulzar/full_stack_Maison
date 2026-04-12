import { useEffect, useState } from "react";
import { sanityClient } from "@/lib/sanity";
import { Product } from "@/types/product";

export interface HeroSlide {
  _key?: string;
  subtitle?: string;
  title: string;
  titleAccent?: string;
  description?: string;
  image: string;
  ctaLabel?: string;
  ctaLink?: string;
}

export interface CollectionCard {
  _key?: string;
  title: string;
  subtitle?: string;
  image: string;
  link: string; // auto-built
}

export interface CategoryCard {
  _key?: string;
  title: string;
  image: string;
  link: string; // auto-built
}

interface RawCollectionCard {
  _key?: string;
  title: string;
  subtitle?: string;
  image: string;
  wearType?: string;
  stitchType?: string;
  filterNew?: boolean;
}

interface RawCategoryCard {
  _key?: string;
  title: string;
  image: string;
  categoryWear?: string;
  categoryType?: string;
  categoryTitle?: string;
}

function buildCollectionLink(c: RawCollectionCard): string {
  const params: string[] = [];
  if (c.wearType && c.wearType !== "all") params.push(`wear=${c.wearType}`);
  if (c.wearType === "eastern" && c.stitchType && c.stitchType !== "all") params.push(`type=${c.stitchType}`);
  if (c.filterNew) params.push("filter=new");
  return params.length ? `/shop?${params.join("&")}` : "/shop";
}

function buildCategoryLink(c: RawCategoryCard): string {
  const params: string[] = [];
  if (c.categoryWear) params.push(`wear=${c.categoryWear}`);
  if (c.categoryType) params.push(`type=${c.categoryType}`);
  if (c.categoryTitle) params.push(`cat=${encodeURIComponent(c.categoryTitle)}`);
  return params.length ? `/shop?${params.join("&")}` : "/shop";
}

export interface HomepageDoc {
  heroSlides: HeroSlide[];
  marqueeItems?: string[];
  collections?: CollectionCard[];
  shopByCategory?: CategoryCard[];
  featuredProducts: Product[];
  newArrivals: Product[];
  editorialBanner?: {
    subtitle?: string;
    title?: string;
    titleAccent?: string;
    description?: string;
    image?: string;
    ctaLabel?: string;
    ctaLink?: string;
  };
}

const PRODUCT_PROJECTION = `{
  "id": _id,
  "name": title,
  price,
  priceFormatted,
  "image": images[0].asset->url,
  "category": coalesce(category->title, ""),
  isNew,
  "description": coalesce(description, ""),
  "sizes": coalesce(sizes, []),
  "colors": coalesce(colors, []),
  wearType,
  type,
  "slug": slug.current
}`;

const QUERY = `*[_type=="homepage"][0]{
  "heroSlides": coalesce(heroSlides[]{
    _key, subtitle, title, titleAccent, description,
    "image": image.asset->url, ctaLabel, ctaLink
  }, []),
  "marqueeItems": coalesce(marqueeItems, []),
  "collections": coalesce(collections[]{
    _key, title, subtitle, "image": image.asset->url, wearType, stitchType, filterNew
  }, []),
  "shopByCategory": coalesce(shopByCategory[]{
    _key, title, "image": image.asset->url,
    "categoryWear": category->wearType,
    "categoryType": category->type,
    "categoryTitle": category->title
  }, []),
  "featuredProducts": coalesce(featuredProducts[]->${PRODUCT_PROJECTION}, []),
  "newArrivals": coalesce(newArrivals[]->${PRODUCT_PROJECTION}, []),
  "editorialBanner": editorialBanner{
    subtitle, title, titleAccent, description,
    "image": image.asset->url, ctaLabel, ctaLink
  }
}`;

export function useHomepage() {
  const [data, setData] = useState<HomepageDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    sanityClient
      .fetch<any>(QUERY)
      .then((r) => {
        if (!mounted || !r) return setData(null);
        // Transform raw collections/categories → add auto-built links
        const doc: HomepageDoc = {
          ...r,
          collections: (r.collections || []).map((c: RawCollectionCard) => ({
            _key: c._key,
            title: c.title,
            subtitle: c.subtitle,
            image: c.image,
            link: buildCollectionLink(c),
          })),
          shopByCategory: (r.shopByCategory || []).map((c: RawCategoryCard) => ({
            _key: c._key,
            title: c.title,
            image: c.image,
            link: buildCategoryLink(c),
          })),
        };
        setData(doc);
      })
      .catch(() => mounted && setData(null))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return { data, loading };
}
