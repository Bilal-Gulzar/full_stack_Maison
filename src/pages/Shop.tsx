import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SizeGuide from "@/components/SizeGuide";
import { occasions, seasons, fits, fabrics } from "@/lib/filterOptions";
import { useProducts } from "@/hooks/useProducts";
import { Heart, SlidersHorizontal, Ruler, ChevronDown, Grid2X2, Grid3X3, LayoutList, X, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageMeta } from "@/hooks/usePageMeta";
import PageTransition from "@/components/PageTransition";

const westernCategories = ["All", "Knitwear", "Trousers", "Shirts", "Footwear", "Polos", "Outerwear"];
const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name A–Z", value: "name-asc" },
];
const priceRanges = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under Rs.5,000", min: 0, max: 5000 },
  { label: "Rs.5,000 – 10,000", min: 5000, max: 10000 },
  { label: "Rs.10,000+", min: 10000, max: Infinity },
];
const allSizes = ["S", "M", "L", "XL", "XXL"];
const allColors = ["White", "Black", "Charcoal", "Navy", "Ivory", "Tan", "Olive", "Cream", "Maroon", "Green", "Gold", "Brown", "Beige"];

type GridLayout = 1 | 2 | 3;

const ITEMS_PER_PAGE = 8;

const ProductSkeleton = ({ layout }: { layout: GridLayout }) => {
  if (layout === 1) {
    return (
      <div className="flex gap-6 items-start">
        <Skeleton className="w-48 md:w-64 aspect-[4/5] flex-shrink-0" />
        <div className="flex-1 py-2 space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }
  return (
    <div>
      <Skeleton className="aspect-[4/5] mb-4" />
      <Skeleton className="h-3 w-16 mb-2" />
      <Skeleton className="h-5 w-32 mb-1" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
};

const Shop = () => {
  usePageMeta({ title: "Shop", description: "Browse MAISON's full menswear collection — suits, casual essentials, and accessories." });
  const { products, loading: productsLoading } = useProducts();
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("All");
  const [wearType, setWearType] = useState<"all" | "eastern" | "western">("all");
  const [stitchType, setStitchType] = useState<"all" | "stitched" | "unstitched">("all");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState(0);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [selectedFits, setSelectedFits] = useState<string[]>([]);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [onlyNew, setOnlyNew] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [gridLayout, setGridLayout] = useState<GridLayout>(2);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [loadingMore, setLoadingMore] = useState(false);
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Parse URL params
  useEffect(() => {
    const wear = searchParams.get("wear");
    const type = searchParams.get("type");
    const sub = searchParams.get("sub");
    const cat = searchParams.get("cat");
    const filter = searchParams.get("filter");

    if (wear === "eastern") {
      setWearType("eastern");
      if (type === "stitched") setStitchType("stitched");
      else if (type === "unstitched") setStitchType("unstitched");
    } else if (wear === "western") {
      setWearType("western");
      setStitchType("all");
    }
    if (cat) setActiveCategory(cat);
    if (filter === "new") setOnlyNew(true);
  }, [searchParams]);

  const loading = productsLoading;

  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

  const activeFilterCount = [
    priceRange > 0 ? 1 : 0,
    selectedSizes.length > 0 ? 1 : 0,
    selectedColors.length > 0 ? 1 : 0,
    selectedOccasions.length > 0 ? 1 : 0,
    selectedSeasons.length > 0 ? 1 : 0,
    selectedFits.length > 0 ? 1 : 0,
    selectedFabrics.length > 0 ? 1 : 0,
    onlyNew ? 1 : 0,
    wearType !== "all" ? 1 : 0,
    stitchType !== "all" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearAllFilters = () => {
    setActiveCategory("All");
    setWearType("all");
    setStitchType("all");
    setPriceRange(0);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedOccasions([]);
    setSelectedSeasons([]);
    setSelectedFits([]);
    setSelectedFabrics([]);
    setOnlyNew(false);
  };

  const filtered = useMemo(() => {
    let result = [...products];

    if (wearType !== "all") result = result.filter((p) => p.wearType === wearType);
    if (wearType === "eastern" && stitchType !== "all") result = result.filter((p) => p.type === stitchType);
    if (activeCategory !== "All") result = result.filter((p) => p.category === activeCategory);

    const range = priceRanges[priceRange];
    result = result.filter((p) => p.price >= range.min && p.price < range.max);

    if (selectedSizes.length > 0) result = result.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    if (selectedColors.length > 0) result = result.filter((p) => p.colors.some((c) => selectedColors.includes(c)));
    if (selectedOccasions.length > 0) result = result.filter((p) => p.occasion && selectedOccasions.includes(p.occasion));
    if (selectedSeasons.length > 0) result = result.filter((p) => p.season && selectedSeasons.includes(p.season));
    if (selectedFits.length > 0) result = result.filter((p) => p.fit && selectedFits.includes(p.fit));
    if (selectedFabrics.length > 0) result = result.filter((p) => p.fabric && selectedFabrics.includes(p.fabric));
    if (onlyNew) result = result.filter((p) => p.isNew);

    switch (sortBy) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "name-asc": result.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }
    return result;
  }, [products, activeCategory, wearType, stitchType, sortBy, priceRange, selectedSizes, selectedColors, selectedOccasions, selectedSeasons, selectedFits, selectedFabrics, onlyNew]);

  const visibleProducts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
      setLoadingMore(false);
    }, 600);
  }, [loadingMore, hasMore]);

  // Intersection observer for load more
  useEffect(() => {
    const ref = loadMoreRef.current;
    if (!ref) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: "200px" }
    );
    obs.observe(ref);
    return () => obs.disconnect();
  }, [loadMore]);

  const handleQuickAdd = (e: React.MouseEvent, product: typeof products[0]) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.sizes[0], product.colors[0]);
    toast.success(`${product.name} added to bag`);
  };

  const handleWishlist = (e: React.MouseEvent, product: typeof products[0]) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
    const wishlisted = isInWishlist(product.id);
    toast.success(wishlisted ? `${product.name} removed from wishlist` : `${product.name} added to wishlist`);
  };

  const gridClasses: Record<GridLayout, string> = {
    1: "grid grid-cols-1 gap-y-8",
    2: "grid grid-cols-2 gap-4 md:gap-6",
    3: "grid grid-cols-3 gap-3 md:gap-6",
  };

  const categoryTabs = wearType === "eastern"
    ? ["Shalwar Kameez", "Kurta Pajama", "Short Kurta", "Waistcoat", "Casual Wear"]
    : wearType === "western"
    ? ["Knitwear", "Trousers", "Shirts", "Footwear", "Polos", "Outerwear"]
    : ["All", ...new Set(products.map((p) => p.category))];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <PageTransition>
        <div className="pt-20 md:pt-24">
          {/* Header */}
          <div className="section-padding py-12 md:py-20 border-b border-border">
            <p className="text-xs font-body tracking-[0.3em] uppercase text-primary mb-3">Collection</p>
            <h1 className="font-display text-4xl md:text-6xl font-light text-foreground">
              {wearType === "eastern" ? "Eastern Wear" : wearType === "western" ? "Western Wear" : "Shop All"}
            </h1>
          </div>

          {/* Wear type pills */}
          <div className="section-padding py-3 border-b border-border">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
              {(["all", "eastern", "western"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => { setWearType(type); setActiveCategory("All"); setStitchType("all"); setVisibleCount(ITEMS_PER_PAGE); }}
                  className={`flex-shrink-0 px-4 py-2 text-[11px] font-body tracking-[0.15em] uppercase transition-all duration-200 border whitespace-nowrap ${
                    wearType === type
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {type === "all" ? "All" : type === "eastern" ? "Eastern" : "Western"}
                </button>
              ))}
              {wearType === "eastern" && (
                <>
                  <div className="w-px bg-border mx-1 flex-shrink-0" />
                  {(["all", "stitched", "unstitched"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => { setStitchType(type); setActiveCategory("All"); setVisibleCount(ITEMS_PER_PAGE); }}
                      className={`flex-shrink-0 px-4 py-2 text-[11px] font-body tracking-[0.15em] uppercase transition-all duration-200 border whitespace-nowrap ${
                        stitchType === type
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                      }`}
                    >
                      {type === "all" ? "All" : type}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Category tabs */}
          <div className="section-padding py-4 border-b border-border">
            <div className="flex gap-6 overflow-x-auto scrollbar-hide -mx-1 px-1">
              {productsLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-3 w-20 my-2 flex-shrink-0" />
                ))
              ) : (
                [...new Set(categoryTabs)].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setVisibleCount(ITEMS_PER_PAGE); }}
                    className={`text-xs font-body tracking-[0.15em] uppercase whitespace-nowrap transition-colors duration-300 py-2 flex-shrink-0 ${
                      activeCategory === cat ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Toolbar */}
          <div className="section-padding py-3 border-b border-border">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-body tracking-[0.1em] uppercase transition-all duration-200 ${
                    showFilters || activeFilterCount > 0
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <SlidersHorizontal size={13} />
                  <span className="hidden sm:inline">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center leading-none">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-body tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                >
                  <Ruler size={13} />
                  <span className="hidden sm:inline">Size Guide</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="flex items-center rounded-full border border-border overflow-hidden">
                  {([
                    { layout: 1 as GridLayout, icon: <LayoutList size={13} />, label: "Single column" },
                    { layout: 2 as GridLayout, icon: <Grid2X2 size={13} />, label: "Two columns" },
                    { layout: 3 as GridLayout, icon: <Grid3X3 size={13} />, label: "Three columns" },
                  ] as const).map(({ layout, icon, label }) => (
                    <button
                      key={layout}
                      onClick={() => setGridLayout(layout)}
                      className={`w-8 h-8 flex items-center justify-center transition-all duration-200 ${
                        gridLayout === layout
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                      aria-label={label}
                    >
                      {icon}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowSort(!showSort)}
                    className="flex items-center gap-1 px-3 py-2 rounded-full text-[11px] font-body tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                  >
                    Sort
                    <ChevronDown size={12} className={`transition-transform duration-200 ${showSort ? "rotate-180" : ""}`} />
                  </button>
                  {showSort && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowSort(false)} />
                      <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg py-1 min-w-[170px] z-20 shadow-xl">
                        {sortOptions.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                            className={`block w-full text-left px-4 py-2.5 text-[11px] font-body tracking-wider transition-colors ${
                              sortBy === opt.value
                                ? "text-primary bg-primary/5"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="border-b border-border">
              <div className="section-padding py-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-body tracking-[0.15em] uppercase text-foreground">Refine Results</p>
                  {activeFilterCount > 0 && (
                    <button onClick={clearAllFilters} className="flex items-center gap-1 text-[10px] font-body tracking-wider uppercase text-primary hover:text-foreground transition-colors">
                      <X size={12} /> Clear All
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Price */}
                  <div>
                    <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground mb-3">Price Range</p>
                    <div className="flex flex-wrap gap-2">
                      {priceRanges.map((range, idx) => (
                        <button
                          key={range.label}
                          onClick={() => setPriceRange(idx)}
                          className={`px-3 py-1.5 border text-[11px] font-body tracking-wider transition-colors ${
                            priceRange === idx
                              ? "border-primary text-primary bg-primary/10"
                              : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sizes */}
                  <div>
                    <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground mb-3">Size</p>
                    <div className="flex flex-wrap gap-1.5">
                      {allSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSizes(toggleArrayItem(selectedSizes, size))}
                          className={`w-9 h-9 border text-[11px] font-body transition-colors flex items-center justify-center ${
                            selectedSizes.includes(size)
                              ? "border-primary text-primary bg-primary/10"
                              : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground mb-3">Color</p>
                    <div className="flex flex-wrap gap-2">
                      {allColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColors(toggleArrayItem(selectedColors, color))}
                          className={`px-3 py-1.5 border text-[11px] font-body tracking-wider transition-colors ${
                            selectedColors.includes(color)
                              ? "border-primary text-primary bg-primary/10"
                              : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Occasion */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground mb-3">Occasion</p>
                      <div className="flex flex-wrap gap-2">
                        {occasions.map((occ) => (
                          <button
                            key={occ}
                            onClick={() => setSelectedOccasions(toggleArrayItem(selectedOccasions, occ))}
                            className={`px-3 py-1.5 border text-[11px] font-body tracking-wider transition-colors ${
                              selectedOccasions.includes(occ)
                                ? "border-primary text-primary bg-primary/10"
                                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                            }`}
                          >
                            {occ}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground mb-3">Season</p>
                      <div className="flex flex-wrap gap-2">
                        {seasons.map((s) => (
                          <button
                            key={s}
                            onClick={() => setSelectedSeasons(toggleArrayItem(selectedSeasons, s))}
                            className={`px-3 py-1.5 border text-[11px] font-body tracking-wider transition-colors ${
                              selectedSeasons.includes(s)
                                ? "border-primary text-primary bg-primary/10"
                                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Fit */}
                  <div>
                    <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground mb-3">Fit</p>
                    <div className="flex flex-wrap gap-2">
                      {fits.map((f) => (
                        <button
                          key={f}
                          onClick={() => setSelectedFits(toggleArrayItem(selectedFits, f))}
                          className={`px-3 py-1.5 border text-[11px] font-body tracking-wider transition-colors ${
                            selectedFits.includes(f)
                              ? "border-primary text-primary bg-primary/10"
                              : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fabric */}
                  <div>
                    <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground mb-3">Fabric</p>
                    <div className="flex flex-wrap gap-2">
                      {fabrics.slice(0, 8).map((fab) => (
                        <button
                          key={fab}
                          onClick={() => setSelectedFabrics(toggleArrayItem(selectedFabrics, fab))}
                          className={`px-3 py-1.5 border text-[11px] font-body tracking-wider transition-colors ${
                            selectedFabrics.includes(fab)
                              ? "border-primary text-primary bg-primary/10"
                              : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                          }`}
                        >
                          {fab}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* New Only */}
                  <div>
                    <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground mb-3">Availability</p>
                    <button
                      onClick={() => setOnlyNew(!onlyNew)}
                      className={`px-3 py-1.5 border text-[11px] font-body tracking-wider transition-colors ${
                        onlyNew
                          ? "border-primary text-primary bg-primary/10"
                          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                      }`}
                    >
                      New Arrivals Only
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active filter tags */}
          {activeFilterCount > 0 && (
            <div className="section-padding pt-4 flex flex-wrap gap-2">
              {wearType !== "all" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-[11px] font-body tracking-wider text-foreground border border-border">
                  {wearType}
                  <X size={10} className="cursor-pointer hover:text-primary" onClick={() => setWearType("all")} />
                </span>
              )}
              {stitchType !== "all" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-[11px] font-body tracking-wider text-foreground border border-border">
                  {stitchType}
                  <X size={10} className="cursor-pointer hover:text-primary" onClick={() => setStitchType("all")} />
                </span>
              )}
              {priceRange > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-[11px] font-body tracking-wider text-foreground border border-border">
                  {priceRanges[priceRange].label}
                  <X size={10} className="cursor-pointer hover:text-primary" onClick={() => setPriceRange(0)} />
                </span>
              )}
              {selectedOccasions.map((o) => (
                <span key={o} className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-[11px] font-body tracking-wider text-foreground border border-border">
                  {o}
                  <X size={10} className="cursor-pointer hover:text-primary" onClick={() => setSelectedOccasions(selectedOccasions.filter((x) => x !== o))} />
                </span>
              ))}
              {selectedFits.map((f) => (
                <span key={f} className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-[11px] font-body tracking-wider text-foreground border border-border">
                  {f}
                  <X size={10} className="cursor-pointer hover:text-primary" onClick={() => setSelectedFits(selectedFits.filter((x) => x !== f))} />
                </span>
              ))}
              {selectedFabrics.map((f) => (
                <span key={f} className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-[11px] font-body tracking-wider text-foreground border border-border">
                  {f}
                  <X size={10} className="cursor-pointer hover:text-primary" onClick={() => setSelectedFabrics(selectedFabrics.filter((x) => x !== f))} />
                </span>
              ))}
              {onlyNew && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-[11px] font-body tracking-wider text-foreground border border-border">
                  New Only
                  <X size={10} className="cursor-pointer hover:text-primary" onClick={() => setOnlyNew(false)} />
                </span>
              )}
            </div>
          )}

          {/* Results count */}
          <div className="section-padding pt-6">
            <p className="text-[10px] font-body tracking-[0.15em] uppercase text-muted-foreground">
              {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Products Grid */}
          <div className="section-padding py-8 md:py-16">
            {loading ? (
              <div className={gridClasses[gridLayout]}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductSkeleton key={i} layout={gridLayout} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-body text-muted-foreground">No products found matching your filters.</p>
                <button onClick={clearAllFilters} className="mt-4 text-primary font-body text-sm underline">
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className={gridClasses[gridLayout]}>
                  {visibleProducts.map((product) => (
                    <div key={product.id}>
                      <Link to={`/product/${product.id}`} className={`group ${gridLayout === 1 ? "flex gap-6 items-start" : "block"}`}>
                        <div className={`relative bg-secondary overflow-hidden ${gridLayout === 1 ? "w-48 md:w-64 aspect-[4/5] flex-shrink-0" : "aspect-[4/5] mb-4"}`}>
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                          {product.isNew && (
                            <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-body tracking-[0.15em] uppercase px-3 py-1">New</span>
                          )}
                          {product.fabric && (
                            <span className="absolute top-3 right-12 bg-background/80 backdrop-blur-sm text-[9px] font-body tracking-wider text-foreground px-2 py-0.5">
                              {product.fabric}
                            </span>
                          )}
                          <button
                            onClick={(e) => handleWishlist(e, product)}
                            className={`absolute top-3 right-3 w-8 h-8 bg-background/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${
                              isInWishlist(product.id) ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-100 text-foreground hover:text-primary"
                            }`}
                          >
                            <Heart size={14} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                          </button>
                          {gridLayout !== 1 && (
                            <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <button onClick={(e) => handleQuickAdd(e, product)} className="w-full bg-background/90 backdrop-blur-sm text-foreground text-xs font-body tracking-[0.15em] uppercase py-3 hover:bg-primary hover:text-primary-foreground transition-colors duration-300">
                                Quick Add
                              </button>
                            </div>
                          )}
                        </div>
                        <div className={gridLayout === 1 ? "flex-1 py-2" : ""}>
                          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground mb-1">{product.category}</p>
                          <h3 className={`font-display text-foreground mb-1 ${gridLayout === 1 ? "text-xl md:text-2xl" : gridLayout === 3 ? "text-sm" : "text-lg"}`}>{product.name}</h3>
                          <p className="font-body text-sm text-primary mb-2">{product.priceFormatted}</p>
                          {gridLayout === 1 && (
                            <>
                              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">{product.description}</p>
                              <button
                                onClick={(e) => handleQuickAdd(e, product)}
                                className="bg-primary text-primary-foreground text-xs font-body tracking-[0.15em] uppercase px-6 py-2.5 hover:opacity-90 transition-opacity"
                              >
                                Quick Add
                              </button>
                            </>
                          )}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Load more */}
                {hasMore && (
                  <div ref={loadMoreRef} className="flex flex-col items-center justify-center py-12 gap-4">
                    {loadingMore ? (
                      <div className="flex items-center gap-3">
                        <Loader2 size={18} className="animate-spin text-primary" />
                        <span className="text-xs font-body tracking-[0.15em] uppercase text-muted-foreground">Loading more...</span>
                      </div>
                    ) : (
                      <button
                        onClick={loadMore}
                        className="px-8 py-3 border border-border text-xs font-body tracking-[0.2em] uppercase text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                      >
                        Load More Products
                      </button>
                    )}
                    <p className="text-[10px] font-body text-muted-foreground/60">
                      Showing {visibleProducts.length} of {filtered.length}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </PageTransition>
      <SizeGuide isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
      <Footer />
    </div>
  );
};

export default Shop;
