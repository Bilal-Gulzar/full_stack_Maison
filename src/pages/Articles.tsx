import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Clock, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useArticles } from "@/hooks/useArticles";
import { usePageMeta } from "@/hooks/usePageMeta";

const ArticleSkeleton = () => (
  <div className="border border-border overflow-hidden bg-card">
    <Skeleton className="aspect-[3/2]" />
    <div className="p-6 space-y-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-24" />
    </div>
  </div>
);

const FeaturedSkeleton = () => (
  <div className="grid md:grid-cols-2 gap-0 border border-border overflow-hidden">
    <Skeleton className="aspect-[4/3] md:aspect-auto min-h-[280px]" />
    <div className="p-8 md:p-12 space-y-4 bg-card flex flex-col justify-center">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-4 w-28" />
    </div>
  </div>
);

const Articles = () => {
  usePageMeta({
    title: "Men's Style Journal — Fashion Guides & Editorials",
    description:
      "Style notes, fashion guides, and craft stories from MAISON's journal. Read about men's fashion trends, tailoring tips, fabric guides, and wedding style inspiration in Pakistan.",
    keywords: "mens style journal Pakistan, mens fashion blog, menswear guide, tailoring tips, fabric guide, wedding style men, fashion editorials Pakistan",
  });
  const { articles, loading } = useArticles();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 md:pt-24">
        <div className="section-padding py-16 md:py-24 text-center">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4">The Journal</p>
          <h1 className="font-display text-4xl md:text-6xl font-light text-foreground mb-6">
            Articles & Stories
          </h1>
          <p className="font-body text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Insights on style, craftsmanship, and the modern gentleman's wardrobe.
          </p>
        </div>

        {loading ? (
          <>
            <div className="section-padding pb-16">
              <FeaturedSkeleton />
            </div>
            <div className="section-padding pb-20">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 5 }).map((_, i) => (
                  <ArticleSkeleton key={i} />
                ))}
              </div>
            </div>
          </>
        ) : articles.length === 0 ? (
          <div className="section-padding py-20 text-center">
            <p className="font-body text-sm text-muted-foreground mb-2">No articles yet</p>
            <p className="font-body text-xs text-muted-foreground">
              Add articles in <a href="/studio" className="text-primary underline">Sanity Studio</a>.
            </p>
          </div>
        ) : (
          <>
            {/* Featured Article */}
            <div className="section-padding pb-16">
              <div className="grid md:grid-cols-2 gap-0 border border-border overflow-hidden">
                <div className="aspect-[4/3] md:aspect-auto overflow-hidden">
                  {articles[0].coverImage && (
                    <img
                      src={articles[0].coverImage}
                      alt={articles[0].title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  )}
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center bg-card">
                  <h2 className="font-display text-2xl md:text-3xl font-light text-foreground mb-4 leading-tight">
                    {articles[0].title}
                  </h2>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">
                    {articles[0].description}
                  </p>
                  {articles[0].publishedAt && (
                    <div className="flex items-center gap-4 text-muted-foreground mb-8">
                      <span className="font-body text-[10px] tracking-[0.1em] flex items-center gap-1">
                        <Clock size={10} /> {new Date(articles[0].publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <Link
                    to={`/article/${articles[0].slug}`}
                    className="font-body text-xs tracking-[0.2em] uppercase text-primary hover:text-foreground transition-colors flex items-center gap-2 group"
                  >
                    Read Article <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Article Grid */}
            <div className="section-padding pb-20">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.slice(1).map((article) => (
                  <Link
                    to={`/article/${article.slug}`}
                    key={article._id}
                    className="group border border-border overflow-hidden bg-card hover:border-primary/30 transition-colors duration-300"
                  >
                    <div className="aspect-[3/2] overflow-hidden">
                      {article.coverImage && (
                        <img
                          src={article.coverImage}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-display text-lg font-light text-foreground mb-2 leading-snug group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="font-body text-xs text-muted-foreground leading-relaxed mb-4">
                        {article.description}
                      </p>
                      {article.publishedAt && (
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span className="font-body text-[10px] tracking-[0.1em] flex items-center gap-1">
                            <Clock size={10} /> {new Date(article.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Articles;
