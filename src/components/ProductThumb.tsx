import { useState } from "react";
import { Package } from "lucide-react";

interface ProductThumbProps {
  src?: string;
  alt?: string;
  className?: string;
}

/**
 * Square product thumbnail with graceful fallback when the image is missing
 * or fails to load. Used on Order list / detail pages.
 */
const ProductThumb = ({ src, alt = "", className = "" }: ProductThumbProps) => {
  const [errored, setErrored] = useState(false);
  const showFallback = !src || errored;

  return (
    <div className={`relative bg-secondary/60 overflow-hidden flex items-center justify-center ${className}`}>
      {showFallback ? (
        <Package size={20} className="text-muted-foreground/60" />
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setErrored(true)}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};

export default ProductThumb;
