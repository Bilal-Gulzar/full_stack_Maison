import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroMain from "@/assets/hero-main.jpg";
import collectionSuits from "@/assets/collection-suits.jpg";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const FALLBACK_STORY = [
  "Founded in 2018, Maison was born from a simple belief: every man deserves clothing that makes him feel extraordinary. We bridge the gap between classic tailoring and contemporary design.",
  "Our collections are crafted from the finest materials sourced from mills across Italy, Scotland, and Japan. Each piece undergoes meticulous quality control to ensure it meets our exacting standards.",
  "From our atelier in Milan to your wardrobe, every Maison garment carries the promise of enduring style and uncompromising quality.",
];

const FALLBACK_VALUES = [
  { title: "Quality", description: "We source only the finest materials and employ master craftsmen to create garments that last a lifetime." },
  { title: "Sustainability", description: "From eco-conscious fabrics to ethical manufacturing, we're committed to reducing our environmental footprint." },
  { title: "Timelessness", description: "We design beyond trends. Our pieces are investments in style that transcend seasons and years." },
];

const About = () => {
  usePageMeta({
    title: "About MAISON — Pakistan's Luxury Menswear Brand",
    description:
      "The story behind MAISON — Pakistan's luxury menswear brand blending traditional eastern craftsmanship with modern western tailoring. Learn our vision, values, and heritage.",
    keywords: "about MAISON, MAISON brand Pakistan, luxury menswear brand Pakistan, Pakistani menswear designer, mens fashion brand Pakistan, eastern tailoring, western tailoring",
  });
  const { data } = useSiteSettings();
  const story = data?.aboutStory?.length ? data.aboutStory : FALLBACK_STORY;
  const values = data?.aboutValues?.length ? data.aboutValues : FALLBACK_VALUES;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 md:pt-24">
        {/* Hero */}
        <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
          <img src={heroMain} alt="Maison Atelier" className="w-full h-full object-cover" />
          <div className="gradient-overlay absolute inset-0" />
          <div className="absolute bottom-0 left-0 right-0 section-padding pb-12 md:pb-16">
            <p className="text-xs font-body tracking-[0.3em] uppercase text-primary mb-3">Our Story</p>
            <h1 className="font-display text-4xl md:text-6xl font-light text-foreground">About Maison</h1>
          </div>
        </div>

        {/* Story */}
        <div className="section-padding py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-light text-foreground mb-6">
                Crafting Timeless <span className="italic text-primary">Elegance</span>
              </h2>
              <div className="space-y-4 font-body text-sm text-muted-foreground leading-relaxed">
                {story.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>
            <div className="aspect-[4/5] bg-secondary overflow-hidden">
              <img src={collectionSuits} alt="Maison craftsmanship" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="section-padding py-16 md:py-24 border-t border-border">
          <div className="text-center mb-12">
            <p className="text-xs font-body tracking-[0.3em] uppercase text-primary mb-3">Our Values</p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-foreground">What We Stand For</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {values.map((v) => (
              <div key={v.title} className="text-center">
                <h3 className="font-display text-2xl text-foreground mb-3 italic">{v.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
