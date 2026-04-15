import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Clock } from "lucide-react";
import { PortableText, type PortableTextBlock } from "@portabletext/react";
import { useArticleBySlug } from "@/hooks/useArticles";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageMeta } from "@/hooks/usePageMeta";

const ArticleDetail = () => {
  const { slug } = useParams();
  const { article, loading } = useArticleBySlug(slug);
  usePageMeta({
    title: article?.title || "Journal",
    description: article?.description || "Read the latest men's fashion and style article from MAISON's journal — style guides, fabric tips, and editorials for the modern gentleman in Pakistan.",
    image: article?.coverImage,
    keywords: article?.title
      ? `${article.title}, mens fashion Pakistan, menswear style guide, MAISON journal, ${article.title.toLowerCase().split(" ").slice(0, 3).join(", ")}`
      : "mens fashion article Pakistan, menswear journal, style guide",
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 md:pt-24">
          <div className="section-padding py-8">
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="aspect-[21/9] w-full" />
          <div className="max-w-2xl mx-auto section-padding py-12 md:py-16 space-y-4">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 md:pt-24 section-padding py-20 text-center">
          <h1 className="font-display text-3xl text-foreground mb-4">Article Not Found</h1>
          <Link to="/articles" className="font-body text-sm text-primary hover:underline">
            ← Back to Articles
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 md:pt-24">
        <div className="section-padding py-8">
          <Link
            to="/articles"
            className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={14} /> Back to Articles
          </Link>
        </div>

        {article.coverImage && (
          <div className="aspect-[21/9] w-full overflow-hidden">
            <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="max-w-2xl mx-auto section-padding py-12 md:py-16">
          {article.publishedAt && (
            <div className="flex items-center gap-4 mb-6">
              <span className="font-body text-[10px] tracking-[0.1em] text-muted-foreground flex items-center gap-1">
                <Clock size={10} /> {new Date(article.publishedAt).toLocaleDateString()}
              </span>
            </div>
          )}

          <h1 className="font-display text-3xl md:text-5xl font-light text-foreground mb-8 leading-tight">
            {article.title}
          </h1>

          <div className="prose prose-neutral dark:prose-invert max-w-none font-body text-sm text-muted-foreground leading-[1.9]">
            {article.content ? (
              <PortableText value={article.content as PortableTextBlock[]} />
            ) : (
              <p className="whitespace-pre-line">{article.description}</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ArticleDetail;
