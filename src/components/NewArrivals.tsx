import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";
import ProductCard from "./ProductCard";
import { useHomepage } from "@/hooks/useHomepage";
import { Skeleton } from "@/components/ui/skeleton";

const NewArrivals = () => {
  const { data, loading } = useHomepage();
  const products = (data?.newArrivals || []).slice(0, 6);

  return (
    <section id="new-arrivals" className="section-padding py-20 md:py-32 border-t border-border">
      <ScrollReveal>
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs font-body tracking-[0.3em] uppercase text-primary mb-3">
              Just Landed
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-foreground">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/shop?filter=new"
            className="hidden md:block text-xs font-body tracking-[0.15em] uppercase text-muted-foreground hover:text-primary transition-colors line-accent"
          >
            Shop All New
          </Link>
        </div>
      </ScrollReveal>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[4/5] w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      )}
      {!loading && products.length === 0 && (
        <p className="text-center font-body text-sm text-muted-foreground py-12">
          No products yet — add some in <a href="/studio" className="text-primary underline">Studio → Homepage → New Arrivals</a>.
        </p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14">
        {!loading && products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default NewArrivals;
