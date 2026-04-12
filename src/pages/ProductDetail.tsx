import { useState, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Minus, Plus, Check, Ruler, Heart, X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import SizeGuide from "@/components/SizeGuide";
import ScrollReveal from "@/components/ScrollReveal";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageMeta } from "@/hooks/usePageMeta";

const ProductDetail = () => {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const product = products.find((p) => p.id === id || p.slug === id);
  usePageMeta({
    title: product ? product.name : "Product",
    description: product
      ? `${product.name} — ${product.description?.slice(0, 150) || "Discover this piece from MAISON's curated menswear collection."}`
      : undefined,
    image: product?.images?.[0],
  });
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const wishlisted = product ? isInWishlist(product.id) : false;
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const zoomRef = useRef<HTMLDivElement>(null);

  // "You May Like" - products from same category or wear type
  const youMayLike = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.id !== product.id && (p.category === product.category || p.wearType === product.wearType))
      .slice(0, 4);
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 md:pt-24">
          <div className="section-padding py-4 border-b border-border">
            <Skeleton className="h-3 w-48" />
          </div>
          <div className="section-padding py-12 md:py-20">
            <div className="grid md:grid-cols-2 gap-10 md:gap-16">
              {/* Image gallery skeleton */}
              <div>
                <Skeleton className="aspect-[4/5] w-full" />
                <div className="flex gap-2 mt-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="w-16 h-20 md:w-20 md:h-24" />
                  ))}
                </div>
              </div>
              {/* Details skeleton */}
              <div className="flex flex-col justify-center space-y-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="pt-4 space-y-3">
                  <Skeleton className="h-3 w-12" />
                  <div className="flex gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="w-12 h-12" />
                    ))}
                  </div>
                </div>
                <div className="pt-4 space-y-3">
                  <Skeleton className="h-3 w-12" />
                  <div className="flex gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="w-20 h-9" />
                    ))}
                  </div>
                </div>
                <Skeleton className="h-12 w-full mt-4" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <div className="text-center pt-20">
          <h1 className="font-display text-3xl text-foreground mb-4">Product Not Found</h1>
          <Link to="/shop" className="text-primary font-body text-sm underline">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const galleryImages = [product.image, product.image, product.image, product.image];

  const outOfStock = product.stock !== undefined && product.stock <= 0;

  const handleAddToCart = () => {
    if (outOfStock) { toast.error("This item is out of stock"); return; }
    if (!selectedSize) { toast.error("Please select a size"); return; }
    if (!selectedColor) { toast.error("Please select a color"); return; }
    addItem(product, selectedSize, selectedColor, quantity);
    toast.success(`${product.name} added to bag`, { icon: <Check size={16} /> });
  };

  const openZoom = () => {
    setZoomScale(1);
    setZoomPosition({ x: 0, y: 0 });
    setZoomOpen(true);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoomScale((prev) => Math.min(5, Math.max(1, prev + (e.deltaY > 0 ? -0.3 : 0.3))));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (zoomScale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - zoomPosition.x, y: e.clientY - zoomPosition.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setZoomPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handlePointerUp = () => setIsDragging(false);

  const handleDoubleClick = () => {
    if (zoomScale > 1) {
      setZoomScale(1);
      setZoomPosition({ x: 0, y: 0 });
    } else {
      setZoomScale(3);
    }
  };

  const navigateImage = (dir: 1 | -1) => {
    setActiveImageIndex((prev) => (prev + dir + galleryImages.length) % galleryImages.length);
    setZoomScale(1);
    setZoomPosition({ x: 0, y: 0 });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 md:pt-24">
        {/* Breadcrumb */}
        <div className="section-padding py-4 border-b border-border">
          <div className="flex gap-2 text-[10px] font-body tracking-[0.15em] uppercase text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>
        </div>

        <div className="section-padding py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16">
            {/* Image Gallery */}
            <div>
              <div
                className="aspect-[4/5] bg-secondary overflow-hidden relative cursor-zoom-in group"
                onClick={openZoom}
              >
                <img
                  src={galleryImages[activeImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-background/0 group-hover:bg-background/5 transition-colors flex items-center justify-center">
                  <ZoomIn size={24} className="text-foreground/0 group-hover:text-foreground/60 transition-colors" />
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`w-16 h-20 md:w-20 md:h-24 bg-secondary overflow-hidden border-2 transition-colors ${
                      activeImageIndex === i ? "border-primary" : "border-transparent hover:border-border"
                    }`}
                  >
                    <img src={img} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-col justify-center">
              <p className="text-[10px] font-body tracking-[0.3em] uppercase text-primary mb-2">{product.category}</p>
              <h1 className="font-display text-3xl md:text-5xl font-light text-foreground mb-2">{product.name}</h1>
              <div className="flex items-center justify-between mb-6">
                <p className="font-display text-2xl text-primary">{product.priceFormatted}</p>
                <button
                  onClick={() => {
                    toggleItem(product);
                    toast.success(wishlisted ? `${product.name} removed from wishlist` : `${product.name} added to wishlist`);
                  }}
                  className={`w-10 h-10 border flex items-center justify-center transition-all duration-300 ${
                    wishlisted ? "border-primary text-primary" : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
                </button>
              </div>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8">{product.description}</p>

              {/* Product details tags */}
              {(product.fabric || product.occasion || product.fit) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {product.fabric && (
                    <span className="px-3 py-1 border border-border text-[10px] font-body tracking-wider text-muted-foreground">{product.fabric}</span>
                  )}
                  {product.occasion && (
                    <span className="px-3 py-1 border border-border text-[10px] font-body tracking-wider text-muted-foreground">{product.occasion}</span>
                  )}
                  {product.fit && (
                    <span className="px-3 py-1 border border-border text-[10px] font-body tracking-wider text-muted-foreground">{product.fit}</span>
                  )}
                  {product.season && (
                    <span className="px-3 py-1 border border-border text-[10px] font-body tracking-wider text-muted-foreground">{product.season}</span>
                  )}
                </div>
              )}

              {/* Size */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-body tracking-[0.15em] uppercase text-foreground">Size</p>
                  <button onClick={() => setSizeGuideOpen(true)} className="flex items-center gap-1 text-[10px] font-body tracking-wider text-primary hover:underline">
                    <Ruler size={12} /> Size Guide
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[48px] h-12 px-3 border text-xs font-body tracking-wider uppercase transition-colors duration-300 ${
                        selectedSize === size
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="mb-8">
                <p className="text-xs font-body tracking-[0.15em] uppercase text-foreground mb-3">Color</p>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border text-xs font-body tracking-wider transition-colors duration-300 ${
                        selectedColor === color
                          ? "border-primary text-primary"
                          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity + Add */}
              <div className="flex gap-4 items-center">
                <div className="flex items-center border border-border">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-12 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="w-10 h-12 flex items-center justify-center font-body text-sm text-foreground">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-12 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                  className={`flex-1 py-3 text-xs font-body tracking-[0.2em] uppercase transition-colors duration-300 ${outOfStock ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-primary-foreground hover:bg-accent/90"}`}
                >
                  {outOfStock ? "Out of Stock" : "Add to Bag"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Like */}
        {youMayLike.length > 0 && (
          <section className="section-padding py-16 md:py-24 border-t border-border">
            <ScrollReveal>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-xs font-body tracking-[0.3em] uppercase text-primary mb-3">Recommended</p>
                  <h2 className="font-display text-3xl md:text-4xl font-light text-foreground">You May Also Like</h2>
                </div>
                <Link to="/shop" className="hidden md:block text-xs font-body tracking-[0.15em] uppercase text-muted-foreground hover:text-primary transition-colors line-accent">
                  View All
                </Link>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {youMayLike.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Gallery Zoom Overlay */}
      {zoomOpen && (
        <div className="fixed inset-0 z-[100] bg-background/98 backdrop-blur-md flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
            <p className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground">
              {activeImageIndex + 1} / {galleryImages.length}
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 border border-border">
                <button
                  onClick={() => { setZoomScale(Math.max(1, zoomScale - 0.5)); if (zoomScale <= 1.5) setZoomPosition({ x: 0, y: 0 }); }}
                  className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="font-body text-[11px] text-foreground w-10 text-center">{Math.round(zoomScale * 100)}%</span>
                <button
                  onClick={() => setZoomScale(Math.min(5, zoomScale + 0.5))}
                  className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                onClick={() => setZoomOpen(false)}
                className="w-10 h-10 border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 relative flex items-center justify-center overflow-hidden select-none">
            <button onClick={() => navigateImage(-1)} className="absolute left-4 z-10 w-10 h-10 border border-border bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition-colors">
              <ChevronLeft size={18} />
            </button>
            <div
              ref={zoomRef}
              className="w-full h-full flex items-center justify-center overflow-hidden touch-none"
              onWheel={handleWheel}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onDoubleClick={handleDoubleClick}
              style={{ cursor: zoomScale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in" }}
            >
              <img
                src={galleryImages[activeImageIndex]}
                alt={product.name}
                className="max-w-full max-h-full object-contain transition-transform duration-200 pointer-events-none"
                draggable={false}
                style={{
                  transform: `scale(${zoomScale}) translate(${zoomPosition.x / zoomScale}px, ${zoomPosition.y / zoomScale}px)`,
                }}
              />
            </div>
            <button onClick={() => navigateImage(1)} className="absolute right-4 z-10 w-10 h-10 border border-border bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 px-6 py-4 flex-shrink-0">
            {galleryImages.map((img, i) => (
              <button
                key={i}
                onClick={() => { setActiveImageIndex(i); setZoomScale(1); setZoomPosition({ x: 0, y: 0 }); }}
                className={`w-12 h-14 md:w-14 md:h-16 bg-secondary overflow-hidden border-2 transition-all ${
                  activeImageIndex === i ? "border-primary opacity-100" : "border-transparent opacity-50 hover:opacity-80"
                }`}
              >
                <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      <SizeGuide isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
      <Footer />
    </div>
  );
};

export default ProductDetail;
