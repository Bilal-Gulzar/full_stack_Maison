import { sanityClient } from "@/lib/sanity";

export interface SanityArticle {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
  content?: unknown[]; // portable text
  publishedAt?: string;
}

const PROJECTION = `{
  _id,
  title,
  "slug": slug.current,
  description,
  "coverImage": coverImage.asset->url,
  content,
  publishedAt
}`;

export async function fetchArticles(): Promise<SanityArticle[]> {
  return sanityClient.fetch(`*[_type=="article"] | order(publishedAt desc) ${PROJECTION}`);
}

export async function fetchArticleBySlug(slug: string): Promise<SanityArticle | null> {
  return sanityClient.fetch(
    `*[_type=="article" && slug.current==$slug][0] ${PROJECTION}`,
    { slug }
  );
}

export async function fetchArticleById(id: string): Promise<SanityArticle | null> {
  return sanityClient.fetch(`*[_type=="article" && _id==$id][0] ${PROJECTION}`, { id });
}
