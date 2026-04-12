import { useEffect, useState } from "react";
import { sanityClient } from "@/lib/sanity";

export interface SanityCategory {
  _id: string;
  title: string;
  slug: string;
  wearType: "western" | "eastern";
  type?: "stitched" | "unstitched";
  subcategory?: string;
}

const PROJECTION = `{
  _id, title, "slug": slug.current, wearType, type, subcategory
}`;

export function useCategories() {
  const [categories, setCategories] = useState<SanityCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    sanityClient
      .fetch<SanityCategory[]>(`*[_type=="category"] | order(wearType asc, title asc) ${PROJECTION}`)
      .then((rows) => mounted && setCategories(rows || []))
      .catch(() => mounted && setCategories([]))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return { categories, loading };
}
