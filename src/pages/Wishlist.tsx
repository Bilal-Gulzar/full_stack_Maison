import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/contexts/WishlistContext";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageMeta } from "@/hooks/usePageMeta";

const Wishlist = () => {
  usePageMeta({ title: "Wishlist", description: "Pieces you've saved for later from MAISON." });
  const { items, loading } = useWishlist();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 md:pt-24">
        <div className="section-padding py-16 md:py-24 text-center">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4">Your Favourites</p>
          <h1 className="font-display text-4xl md:text-6xl font-light text-foreground mb-6">Wishlist</h1>
          {loading ? (
            <Skeleton className="h-3 w-24 mx-auto" />
          ) : (
            <p className="font-body text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? "item" : "items"} saved
            </p>
          )}
        </div>

        {loading ? (
          <div className="section-padding pb-20">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/5] w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="section-padding pb-20 text-center">
            <Heart size={48} className="mx-auto text-muted-foreground/30 mb-6" />
            <p className="font-body text-sm text-muted-foreground mb-8">Your wishlist is empty. Browse our collection and save your favourites.</p>
            <Link
              to="/shop"
              className="inline-block font-body text-xs tracking-[0.2em] uppercase bg-primary text-primary-foreground px-8 py-4 hover:bg-primary/90 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="section-padding pb-20">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;
