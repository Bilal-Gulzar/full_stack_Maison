import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Product } from "@/types/product";
import { toast } from "sonner";
import { formatPrice } from "@/lib/currency";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
    toast.success(wishlisted ? `${product.name} removed from wishlist` : `${product.name} added to wishlist`);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.sizes[0], product.colors[0]);
    toast.success(`${product.name} added to bag`);
  };

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="relative image-reveal aspect-[4/5] bg-secondary mb-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {product.isNew && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-body tracking-[0.15em] uppercase px-3 py-1">
            New
          </span>
        )}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 bg-background/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${
            wishlisted ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-100 text-foreground hover:text-primary"
          }`}
        >
          <Heart size={14} fill={wishlisted ? "currentColor" : "none"} />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleQuickAdd}
            className="w-full bg-background/90 backdrop-blur-sm text-foreground text-xs font-body tracking-[0.15em] uppercase py-3 hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
          >
            Quick Add
          </button>
        </div>
      </div>
      <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground mb-1">
        {product.category}
      </p>
      <h3 className="font-display text-lg text-foreground mb-1">{product.name}</h3>
      <p className="font-body text-sm text-primary">{formatPrice(product.price)}</p>
    </Link>
  );
};

export default ProductCard;
