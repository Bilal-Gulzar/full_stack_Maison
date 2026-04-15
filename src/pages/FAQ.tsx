import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const FALLBACK_FAQS = [
  { question: "How do I find my size?", answer: "Use our Size Guide available on each product page and in the Shop section. We recommend measuring your chest, waist, and inseam for the best fit." },
  { question: "Can I modify or cancel my order?", answer: "Orders can be modified or cancelled within 1 hour of placement. After that, they enter processing and cannot be changed. Contact us immediately if needed." },
  { question: "Do you offer gift wrapping?", answer: "Yes! Select 'Gift Wrap' at checkout for complimentary luxury packaging with a personalized note card." },
  { question: "What payment methods do you accept?", answer: "We accept all major credit cards, PayPal, Apple Pay, Google Pay, and Cash on Delivery for domestic orders." },
  { question: "How do I care for my garments?", answer: "Each item includes detailed care instructions on the label. Generally, we recommend dry cleaning for suits and cold washing for casual pieces." },
  { question: "Do you ship internationally?", answer: "Yes, we ship to over 40 countries. International shipping rates and delivery times vary by destination." },
  { question: "Can I return a sale item?", answer: "Items marked 'Final Sale' cannot be returned. Regular sale items follow our standard 30-day return policy." },
  { question: "How long does a refund take?", answer: "Refunds are processed within 5–7 business days after we receive your return. It may take an additional 3–5 days to appear on your statement." },
];

const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <div className="flex items-center justify-between py-5 cursor-pointer" onClick={() => setOpen(!open)}>
        <h3 className="font-body text-sm tracking-[0.05em] text-foreground pr-4">{q}</h3>
        <Switch checked={open} onCheckedChange={setOpen} />
      </div>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-40 pb-5" : "max-h-0"}`}>
        <p className="font-body text-xs text-muted-foreground leading-relaxed">{a}</p>
      </div>
    </div>
  );
};

const FAQ = () => {
  usePageMeta({
    title: "FAQ — Sizing, Shipping, Returns & Orders",
    description:
      "Frequently asked questions about MAISON — sizing guide, shipping across Pakistan, returns, exchanges, COD payments, and order tracking.",
    keywords: "MAISON FAQ, mens clothing sizing Pakistan, shipping Pakistan menswear, COD menswear Pakistan, return policy menswear, order tracking",
  });
  const { data } = useSiteSettings();
  const faqs = data?.faqs?.length ? data.faqs : FALLBACK_FAQS;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 md:pt-24 section-padding">
        <div className="py-16 md:py-24 text-center">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4">Support</p>
          <h1 className="font-display text-4xl md:text-5xl font-light text-foreground mb-6">
            Frequently Asked Questions
          </h1>
          <p className="font-body text-sm text-muted-foreground max-w-lg mx-auto">
            Quick answers to common questions about orders, shipping, and more.
          </p>
        </div>
        <div className="max-w-2xl mx-auto pb-20 border-t border-border">
          {faqs.map((f) => <FAQItem key={f.question} q={f.question} a={f.answer} />)}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FAQ;
