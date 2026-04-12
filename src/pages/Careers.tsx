import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Briefcase, MapPin } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const FALLBACK_OPENINGS = [
  { title: "Senior Fashion Designer", location: "New York, NY", type: "Full-time", description: "Lead the creative direction for our seasonal collections. 5+ years experience in menswear design required. You'll work closely with our atelier and fabric sourcing teams." },
  { title: "E-Commerce Manager", location: "Remote", type: "Full-time", description: "Drive our online retail strategy, optimize conversion funnels, and manage the digital shopping experience across all platforms." },
  { title: "Retail Store Associate", location: "Los Angeles, CA", type: "Part-time", description: "Deliver exceptional in-store experiences. Passion for menswear and customer service required. Flexible scheduling available." },
  { title: "Sustainability Coordinator", location: "New York, NY", type: "Full-time", description: "Oversee our sustainability initiatives, manage supplier audits, and track progress toward our 2028 environmental goals." },
  { title: "Content & Social Media Specialist", location: "Remote", type: "Contract", description: "Create compelling visual content for Instagram, TikTok, and our editorial blog. Strong photography and copywriting skills needed." },
];

const JobCard = ({ title, location, type, description }: { title: string; location: string; type: string; description: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <div className="flex items-center justify-between py-5 cursor-pointer" onClick={() => setOpen(!open)}>
        <div>
          <h3 className="font-body text-sm tracking-[0.05em] text-foreground">{title}</h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1">
              <MapPin size={10} /> {location}
            </span>
            <span className="font-body text-[10px] text-primary">{type}</span>
          </div>
        </div>
        <Switch checked={open} onCheckedChange={setOpen} />
      </div>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-40 pb-5" : "max-h-0"}`}>
        <p className="font-body text-xs text-muted-foreground leading-relaxed mb-4">{description}</p>
        <button className="font-body text-xs tracking-[0.2em] uppercase text-primary hover:text-foreground transition-colors">
          Apply Now →
        </button>
      </div>
    </div>
  );
};

const Careers = () => {
  usePageMeta({ title: "Careers", description: "Open roles at MAISON — join the team behind modern luxury menswear." });
  const { data } = useSiteSettings();
  const openings = data?.careersOpenings?.length ? data.careersOpenings : FALLBACK_OPENINGS;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 md:pt-24 section-padding">
        <div className="py-16 md:py-24 text-center">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4">Join Us</p>
          <h1 className="font-display text-4xl md:text-5xl font-light text-foreground mb-6">Careers at Maison</h1>
          <p className="font-body text-sm text-muted-foreground max-w-lg mx-auto">
            Be part of a team that's redefining modern menswear. We value creativity, craftsmanship, and purpose.
          </p>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 border border-primary/30 bg-primary/5">
            <Briefcase size={14} className="text-primary" />
            <span className="font-body text-xs tracking-[0.1em] text-foreground">{openings.length} Open Positions</span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto pb-20 border-t border-border">
          {openings.map((job) => <JobCard key={job.title} {...job} />)}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Careers;
