import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Truck, RotateCcw, Clock, Shield } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const FALLBACK_SHIPPING = [
  { title: "Standard Shipping", content: "Free on orders over $200. Delivery within 5–7 business days. All orders are carefully packaged to ensure your garments arrive in pristine condition." },
  { title: "Express Shipping", content: "Available for $15. Delivery within 2–3 business days. Orders placed before 2 PM EST ship same day." },
  { title: "International Shipping", content: "We ship to over 40 countries. Delivery within 7–14 business days. International duties and taxes may apply at checkout." },
  { title: "Order Tracking", content: "Once your order ships, you'll receive a confirmation email with tracking details. Track your order anytime from your account's Orders page." },
];

const FALLBACK_RETURNS = [
  { title: "30-Day Return Policy", content: "We accept returns within 30 days of delivery. Items must be unworn, unwashed, and in original packaging with all tags attached." },
  { title: "How to Initiate a Return", content: "Log into your account, go to Orders, select the item, and click 'Request Return'. You'll receive a prepaid shipping label via email within 24 hours." },
  { title: "Refund Processing", content: "Refunds are processed within 5–7 business days after we receive and inspect the returned item. The refund will be credited to your original payment method." },
  { title: "Exchanges", content: "Need a different size or color? Exchanges are free. Simply initiate a return and place a new order — we'll expedite shipping on the replacement." },
  { title: "Final Sale Items", content: "Items marked as 'Final Sale' are not eligible for returns or exchanges. These are clearly marked on the product page before purchase." },
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

const ShippingReturns = () => {
  usePageMeta({
    title: "Shipping & Returns — Nationwide Delivery in Pakistan",
    description:
      "MAISON shipping across Pakistan — standard PKR 250, free over PKR 5,000. 3–7 day delivery, COD accepted, easy returns and exchanges. Garment care guide included.",
    keywords: "shipping Pakistan, COD delivery Pakistan, mens clothing returns, free shipping menswear Pakistan, nationwide delivery Lahore Karachi Islamabad, MAISON shipping policy",
  });
  const { data } = useSiteSettings();
  const shippingPolicies = data?.shippingPolicies?.length ? data.shippingPolicies : FALLBACK_SHIPPING;
  const returnPolicies = data?.returnPolicies?.length ? data.returnPolicies : FALLBACK_RETURNS;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 md:pt-24 section-padding">
        <div className="py-16 md:py-24 text-center">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4">Policies</p>
          <h1 className="font-display text-4xl md:text-5xl font-light text-foreground mb-6">Shipping & Returns</h1>
          <p className="font-body text-sm text-muted-foreground max-w-lg mx-auto">
            Everything you need to know about getting your order and our hassle-free return process.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { icon: Truck, label: "Free Shipping", sub: "Orders Rs 5,000+" },
            { icon: RotateCcw, label: "Easy Returns", sub: "30-day window" },
            { icon: Clock, label: "Fast Delivery", sub: "3–7 days" },
            { icon: Shield, label: "Secure Packaging", sub: "Always protected" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="text-center p-6 border border-border bg-card">
              <Icon size={24} className="mx-auto mb-3 text-primary" />
              <p className="font-body text-xs tracking-[0.1em] uppercase text-foreground mb-1">{label}</p>
              <p className="font-body text-[10px] text-muted-foreground">{sub}</p>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-2xl font-light text-foreground mb-8 flex items-center gap-3">
            <Truck size={20} className="text-primary" /> Shipping Information
          </h2>
          <div className="border-t border-border">
            {shippingPolicies.map((p) => <ToggleSection key={p.title} title={p.title} content={p.content} />)}
          </div>
        </div>

        <div className="max-w-2xl mx-auto pb-20">
          <h2 className="font-display text-2xl font-light text-foreground mb-8 flex items-center gap-3">
            <RotateCcw size={20} className="text-primary" /> Returns & Exchanges
          </h2>
          <div className="border-t border-border">
            {returnPolicies.map((p) => <ToggleSection key={p.title} title={p.title} content={p.content} />)}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ShippingReturns;
