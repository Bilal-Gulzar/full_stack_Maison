import { useEffect, useState } from "react";
import { sanityClient } from "@/lib/sanity";
import { SanityArticle } from "@/services/articles";

const PROJECTION = `{
  _id,
  title,
  "slug": slug.current,
  description,
  "coverImage": coverImage.asset->url,
  publishedAt
}`;

export function useArticles() {
  const [articles, setArticles] = useState<SanityArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    sanityClient
      .fetch<SanityArticle[]>(`*[_type=="article"] | order(publishedAt desc) ${PROJECTION}`)
      .then((rows) => mounted && setArticles(rows || []))
      .catch((e) => mounted && setError(e as Error))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return { articles, loading, error };
}

export function useArticleBySlug(slug: string | undefined) {
  const [article, setArticle] = useState<SanityArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    let mounted = true;
    sanityClient
      .fetch<SanityArticle | null>(
        `*[_type=="article" && slug.current==$slug][0]{
          _id, title, "slug": slug.current, description,
          "coverImage": coverImage.asset->url, content, publishedAt
        }`,
        { slug }
      )
      .then((r) => mounted && setArticle(r))
      .catch(() => mounted && setArticle(null))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [slug]);

  return { article, loading };
}
