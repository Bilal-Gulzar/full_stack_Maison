import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { useHomepage } from "@/hooks/useHomepage";
import { Skeleton } from "@/components/ui/skeleton";

// Fallback images (bundled) — used when Sanity data is empty
import collectionSuits from "@/assets/collection-suits.jpg";
import collectionEastern from "@/assets/collection-eastern.jpg";
import easternWaistcoat1 from "@/assets/eastern-waistcoat-1.jpg";
import easternKurta2 from "@/assets/eastern-kurta-2.jpg";
import easternKurta1 from "@/assets/eastern-kurta-1.jpg";
import easternKurta3 from "@/assets/eastern-kurta-3.jpg";

const FALLBACK_COLLECTIONS = [
  { title: "Eastern Wear", subtitle: "Heritage & Elegance", image: collectionEastern, link: "/shop?wear=eastern" },
  { title: "Stitched Collection", subtitle: "Ready to Wear", image: easternKurta2, link: "/shop?wear=eastern&type=stitched" },
  { title: "Unstitched", subtitle: "Premium Fabrics", image: collectionSuits, link: "/shop?wear=eastern&type=unstitched" },
  { title: "Western Wear", subtitle: "Modern Classics", image: easternWaistcoat1, link: "/shop?wear=western" },
];

const FALLBACK_CATEGORIES = [
  { title: "Kurta Pajama", image: easternKurta2, link: "/shop?wear=eastern&cat=Kurta+Pajama" },
  { title: "Shalwar Kameez", image: easternKurta1, link: "/shop?wear=eastern&cat=Shalwar+Kameez" },
  { title: "Waistcoat Sets", image: easternWaistcoat1, link: "/shop?wear=eastern&cat=Waistcoat" },
  { title: "Casual Wear", image: easternKurta3, link: "/shop?wear=eastern&type=stitched&sub=Casual" },
];

const CollectionsGrid = () => {
  const { data, loading } = useHomepage();
  const collections = data?.collections?.length ? data.collections : FALLBACK_COLLECTIONS;
  const categories = data?.shopByCategory?.length ? data.shopByCategory : FALLBACK_CATEGORIES;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll);
    return () => el.removeEventListener("scroll", checkScroll);
  }, [collections]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("a")?.offsetWidth || 300;
    const scrollAmount = cardWidth * 2 + 24;
    el.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
  };

  if (loading) {
    return (
      <section className="section-padding py-20 md:py-32">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-10 w-64 mb-10" />
        <div className="flex gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="flex-shrink-0 aspect-[3/4]" style={{ width: "calc(50% - 8px)" }} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="collections" className="section-padding py-20 md:py-32">
      <ScrollReveal>
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-body tracking-[0.3em] uppercase text-primary mb-3">
              Curated For You
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-foreground">
              Shop By Collection
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`w-10 h-10 flex items-center justify-center border border-border transition-all duration-300 ${
                canScrollLeft
                  ? "text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary"
                  : "text-muted-foreground/30 cursor-not-allowed"
              }`}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`w-10 h-10 flex items-center justify-center border border-border transition-all duration-300 ${
                canScrollRight
                  ? "text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary"
                  : "text-muted-foreground/30 cursor-not-allowed"
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Horizontal scrolling carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {collections.map((col) => (
          <Link
            key={col.title}
            to={col.link}
            className="group flex-shrink-0 snap-start relative overflow-hidden"
            style={{ width: "calc(50% - 8px)" }}
          >
            <motion.div
              className="relative aspect-[3/4] overflow-hidden"
              whileHover={{ scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              <img
                src={col.image}
                alt={col.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="gradient-overlay absolute inset-0" />
              <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
                {col.subtitle && (
                  <p className="text-[10px] font-body tracking-[0.3em] uppercase text-primary mb-2">
                    {col.subtitle}
                  </p>
                )}
                <h3 className="font-display text-xl md:text-2xl font-light text-foreground">
                  {col.title}
                </h3>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Featured Categories */}
      <div className="mt-16">
        <ScrollReveal>
          <div className="text-center mb-10">
            <p className="text-xs font-body tracking-[0.3em] uppercase text-primary mb-3">Explore</p>
            <h3 className="font-display text-3xl md:text-4xl font-light text-foreground">Shop By Category</h3>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, i) => (
            <ScrollReveal key={cat.title} delay={i * 0.1}>
              <Link to={cat.link} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                    <h4 className="font-display text-lg md:text-xl text-foreground font-light">{cat.title}</h4>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollectionsGrid;
