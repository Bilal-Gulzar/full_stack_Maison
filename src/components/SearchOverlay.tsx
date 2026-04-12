import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, X, ArrowRight } from "lucide-react";
import { easternCategories } from "@/lib/filterOptions";
import { useProducts } from "@/hooks/useProducts";

const allCategories = [
  { label: "Shalwar Kameez", to: "/shop?wear=eastern&cat=Shalwar+Kameez" },
  { label: "Kurta Pajama", to: "/shop?wear=eastern&cat=Kurta+Pajama" },
  { label: "Short Kurta", to: "/shop?wear=eastern&cat=Short+Kurta" },
  { label: "Waistcoat Sets", to: "/shop?wear=eastern&cat=Waistcoat" },
  { label: "Unstitched", to: "/shop?wear=eastern&type=unstitched" },
  { label: "Knitwear", to: "/shop?wear=western&cat=Knitwear" },
  { label: "Shirts", to: "/shop?wear=western&cat=Shirts" },
  { label: "Outerwear", to: "/shop?wear=western&cat=Outerwear" },
  { label: "Footwear", to: "/shop?wear=western&cat=Footwear" },
];

const SearchOverlay = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { products } = useProducts();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [onClose, isOpen]);

  const results = query.trim().length > 0
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          (p.fabric && p.fabric.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const matchingCategories = query.trim().length > 0
    ? allCategories.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : [];

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[110] bg-background/98 backdrop-blur-lg animate-fade-in"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="section-padding pt-6 max-w-4xl mx-auto">
        {/* Search input */}
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <Search size={20} className="text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, categories..."
            className="flex-1 bg-transparent text-xl md:text-2xl font-display text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors border border-border hover:border-primary"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results */}
        <div className="mt-8 max-h-[70vh] overflow-y-auto">
          {query.trim().length > 0 && results.length === 0 && matchingCategories.length === 0 && (
            <p className="font-body text-sm text-muted-foreground text-center py-12">
              No results found for "{query}"
            </p>
          )}

          {/* Category matches */}
          {matchingCategories.length > 0 && (
            <div className="mb-8">
              <p className="text-xs font-body tracking-[0.2em] uppercase text-muted-foreground mb-4">Categories</p>
              <div className="space-y-1">
                {matchingCategories.map((cat) => (
                  <Link
                    key={cat.label}
                    to={cat.to}
                    onClick={onClose}
                    className="flex items-center justify-between py-3 px-4 hover:bg-muted/50 transition-colors group"
                  >
                    <span className="font-body text-sm text-foreground">{cat.label}</span>
                    <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {query.trim().length === 0 && (
            <div>
              <p className="text-xs font-body tracking-[0.2em] uppercase text-muted-foreground mb-4">Popular Searches</p>
              <div className="flex flex-wrap gap-2 mb-8">
                {["Shalwar Kameez", "Kurta", "Waistcoat", "Unstitched", "Shirts"].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-4 py-2 border border-border text-xs font-body tracking-wider text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>

              <p className="text-xs font-body tracking-[0.2em] uppercase text-muted-foreground mb-4">Browse Categories</p>
              <div className="grid grid-cols-2 gap-2">
                {allCategories.slice(0, 6).map((cat) => (
                  <Link
                    key={cat.label}
                    to={cat.to}
                    onClick={onClose}
                    className="flex items-center justify-between py-3 px-4 border border-border hover:border-primary hover:text-primary transition-colors"
                  >
                    <span className="font-body text-xs tracking-wider">{cat.label}</span>
                    <ArrowRight size={12} />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div>
              <p className="text-xs font-body tracking-[0.2em] uppercase text-muted-foreground mb-4">
                Products ({results.length})
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    onClick={onClose}
                    className="group"
                  >
                    <div className="aspect-[4/5] bg-secondary overflow-hidden mb-3">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground">{product.category}</p>
                    <h3 className="font-display text-base text-foreground">{product.name}</h3>
                    <p className="font-body text-sm text-primary">{product.priceFormatted}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
