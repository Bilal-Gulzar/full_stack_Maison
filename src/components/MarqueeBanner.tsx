import { useHomepage } from "@/hooks/useHomepage";

const FALLBACK = [
  "Free Shipping on Orders Over Rs 5,000",
  "New Collection Available",
  "Complimentary Alterations",
  "Members Get 10% Off",
];

const MarqueeBanner = () => {
  const { data } = useHomepage();
  const items = data?.marqueeItems?.length ? data.marqueeItems : FALLBACK;

  // Build the scrolling strip: items separated by ★, duplicated for seamless loop
  const strip = items.flatMap((item) => [item, "★"]);

  return (
    <div className="bg-secondary py-3 overflow-hidden border-b border-border">
      <div className="animate-marquee whitespace-nowrap flex">
        {[...strip, ...strip].map((item, i) => (
          <span
            key={i}
            className="mx-6 text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MarqueeBanner;
