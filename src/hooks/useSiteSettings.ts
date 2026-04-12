import { useEffect, useState } from "react";
import { sanityClient } from "@/lib/sanity";

export interface SiteSettings {
  brandTagline?: string;
  aboutStory?: string[];
  aboutValues?: { title: string; description: string }[];
  faqs?: { question: string; answer: string }[];
  shippingPolicies?: { title: string; content: string }[];
  returnPolicies?: { title: string; content: string }[];
  sustainabilitySections?: { title: string; content: string }[];
  careersOpenings?: { title: string; location: string; type: string; description: string }[];
}

const QUERY = `*[_type=="siteSettings"][0]{
  brandTagline,
  "aboutStory": coalesce(aboutStory, []),
  "aboutValues": coalesce(aboutValues[]{title, description}, []),
  "faqs": coalesce(faqs[]{question, answer}, []),
  "shippingPolicies": coalesce(shippingPolicies[]{title, content}, []),
  "returnPolicies": coalesce(returnPolicies[]{title, content}, []),
  "sustainabilitySections": coalesce(sustainabilitySections[]{title, content}, []),
  "careersOpenings": coalesce(careersOpenings[]{title, location, type, description}, [])
}`;

export function useSiteSettings() {
  const [data, setData] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    sanityClient
      .fetch<SiteSettings | null>(QUERY)
      .then((r) => mounted && setData(r))
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return { data, loading };
}
