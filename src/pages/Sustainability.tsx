import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Leaf, Recycle, Heart, Globe } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const FALLBACK_SECTIONS = [
  { title: "Ethical Sourcing", content: "We partner exclusively with certified mills and workshops that uphold fair labor practices. Every supplier is audited annually for compliance with international labor standards." },
  { title: "Sustainable Materials", content: "Over 60% of our collection uses organic cotton, recycled wool, or TENCEL™ fibers. We're committed to reaching 100% sustainable materials by 2028." },
  { title: "Reduced Waste", content: "Our made-to-order program reduces overproduction by 40%. Fabric offcuts are donated to fashion schools or recycled into new textiles." },
  { title: "Carbon Neutral Shipping", content: "All shipments are carbon-offset through verified reforestation projects. We use recycled packaging materials and eliminate single-use plastics." },
  { title: "Garment Longevity Program", content: "We offer complimentary repairs and alterations for life on all Maison garments, because the most sustainable garment is the one you keep wearing." },
];

const ToggleSection = ({ title, content }: { title: string; content: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <div className="flex items-center justify-between py-5 cursor-pointer" onClick={() => setOpen(!open)}>
        <h3 className="font-body text-sm tracking-[0.05em] text-foreground">{title}</h3>
        <Switch checked={open} onCheckedChange={setOpen} />
      </div>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-40 pb-5" : "max-h-0"}`}>
        <p className="font-body text-xs text-muted-foreground leading-relaxed">{content}</p>
      </div>
    </div>
  );
};

const Sustainability = () => {
  usePageMeta({
    title: "Sustainability — Ethical Luxury Menswear Pakistan",
    description:
      "MAISON's commitment to sustainable luxury menswear — ethical sourcing, responsible craftsmanship, and a lower-impact supply chain. Learn how we make conscious fashion in Pakistan.",
    keywords: "sustainable menswear Pakistan, ethical fashion Pakistan, eco-friendly clothing, responsible menswear, slow fashion Pakistan, MAISON sustainability",
  });
  const { data } = useSiteSettings();
  const sections = data?.sustainabilitySections?.length ? data.sustainabilitySections : FALLBACK_SECTIONS;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 md:pt-24 section-padding">
        <div className="py-16 md:py-24 text-center">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4">Our Commitment</p>
          <h1 className="font-display text-4xl md:text-5xl font-light text-foreground mb-6">Sustainability</h1>
          <p className="font-body text-sm text-muted-foreground max-w-lg mx-auto">
            Fashion that respects people and the planet. Here's how we're making a difference.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { icon: Leaf, label: "Organic Materials", sub: "60%+ of collection" },
            { icon: Recycle, label: "Recycled Packaging", sub: "100% plastic-free" },
            { icon: Heart, label: "Fair Labor", sub: "Certified partners" },
            { icon: Globe, label: "Carbon Neutral", sub: "All shipments" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="text-center p-6 border border-border bg-card">
              <Icon size={24} className="mx-auto mb-3 text-primary" />
              <p className="font-body text-xs tracking-[0.1em] uppercase text-foreground mb-1">{label}</p>
              <p className="font-body text-[10px] text-muted-foreground">{sub}</p>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto pb-20 border-t border-border">
          {sections.map((s) => <ToggleSection key={s.title} title={s.title} content={s.content} />)}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Sustainability;
