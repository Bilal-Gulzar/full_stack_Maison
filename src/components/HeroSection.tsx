import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHomepage } from "@/hooks/useHomepage";
import { Skeleton } from "@/components/ui/skeleton";

const HeroSection = () => {
  const { data, loading } = useHomepage();
  const slides = data?.heroSlides || [];
  const [current, setCurrent] = useState(0);

  const next = useCallback(
    () => setCurrent((c) => (slides.length ? (c + 1) % slides.length : 0)),
    [slides.length]
  );
  const prev = useCallback(
    () =>
      setCurrent((c) =>
        slides.length ? (c - 1 + slides.length) % slides.length : 0
      ),
    [slides.length]
  );

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  if (loading) {
    return (
      <section className="relative h-screen w-full overflow-hidden">
        <Skeleton className="absolute inset-0 w-full h-full" />
      </section>
    );
  }

  if (slides.length === 0) {
    return (
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-secondary">
        <div className="text-center">
          <p className="text-xs font-body tracking-[0.3em] uppercase text-primary mb-3">
            No homepage content yet
          </p>
          <p className="font-body text-sm text-muted-foreground">
            Visit <a href="/studio" className="underline">/studio</a> → Homepage to add hero slides.
          </p>
        </div>
      </section>
    );
  }

  const slide = slides[current];

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={slide.image}
          alt={slide.title}
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </AnimatePresence>

      <div className="gradient-overlay-full absolute inset-0" />

      <div className="relative z-10 h-full flex flex-col justify-end section-padding pb-16 md:pb-24">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {slide.subtitle && (
                <p className="text-xs font-body tracking-[0.3em] uppercase text-primary mb-4">
                  {slide.subtitle}
                </p>
              )}
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light text-foreground leading-[0.9] mb-6">
                {slide.title}
                {slide.titleAccent && (
                  <>
                    <br />
                    <span className="italic text-primary">{slide.titleAccent}</span>
                  </>
                )}
              </h1>
              {slide.description && (
                <p className="font-body text-sm text-muted-foreground max-w-md mb-8">
                  {slide.description}
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-4">
            <Link
              to={slide.ctaLink || "/shop"}
              className="inline-block bg-primary text-primary-foreground px-8 py-3 text-xs font-body tracking-[0.2em] uppercase hover:bg-accent/90 transition-colors duration-300"
            >
              {slide.ctaLabel || "Explore Collection"}
            </Link>
            <Link
              to="/shop"
              className="inline-block border border-foreground/30 text-foreground px-8 py-3 text-xs font-body tracking-[0.2em] uppercase hover:border-primary hover:text-primary transition-colors duration-300"
            >
              New Arrivals
            </Link>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-background/20 backdrop-blur-sm text-foreground hover:bg-background/40 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-background/20 backdrop-blur-sm text-foreground hover:bg-background/40 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-0.5 transition-all duration-500 ${
                  i === current ? "w-8 bg-primary" : "w-4 bg-foreground/30"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroSection;
