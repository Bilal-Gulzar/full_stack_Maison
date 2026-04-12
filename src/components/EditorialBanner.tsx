import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useHomepage } from "@/hooks/useHomepage";
import { Skeleton } from "@/components/ui/skeleton";

const EditorialBanner = () => {
  const { data, loading } = useHomepage();
  const banner = data?.editorialBanner;

  if (loading) {
    return (
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        <Skeleton className="absolute inset-0 w-full h-full" />
      </section>
    );
  }

  if (!banner || !banner.image) {
    return null; // nothing to show, hide the section entirely
  }

  return (
    <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
      <motion.img
        src={banner.image}
        alt={banner.title || "Editorial"}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        width={1920}
        height={900}
        initial={{ scale: 1.1 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
      <div className="absolute inset-0 bg-background/40" />
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center section-padding">
        {banner.subtitle && (
          <motion.p
            className="text-xs font-body tracking-[0.3em] uppercase text-primary mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {banner.subtitle}
          </motion.p>
        )}
        {banner.title && (
          <motion.h2
            className="font-display text-4xl md:text-6xl lg:text-7xl font-light text-foreground leading-[1.1] mb-6 max-w-3xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {banner.title}
            {banner.titleAccent && (
              <>
                {" "}
                <span className="italic text-primary">{banner.titleAccent}</span>
              </>
            )}
          </motion.h2>
        )}
        {banner.description && (
          <motion.p
            className="font-body text-sm text-muted-foreground max-w-md mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {banner.description}
          </motion.p>
        )}
        {banner.ctaLabel && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Link
              to={banner.ctaLink || "/articles"}
              className="inline-block border border-foreground/30 text-foreground px-8 py-3 text-xs font-body tracking-[0.2em] uppercase hover:border-primary hover:text-primary transition-colors duration-300"
            >
              {banner.ctaLabel}
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default EditorialBanner;
