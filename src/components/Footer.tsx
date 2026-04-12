import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const footerLinks = {
  Shop: [
    { label: "New Arrivals", to: "/shop?filter=new" },
    { label: "Shop All", to: "/shop" },
    { label: "Articles", to: "/articles" },
    { label: "Accessories", to: "/shop" },
  ],
  Help: [
    { label: "Contact Us", to: "/contact" },
    { label: "Shipping & Returns", to: "/shipping-returns" },
    { label: "Size Guide", to: "/shop" },
    { label: "FAQs", to: "/faq" },
  ],
  Company: [
    { label: "About Us", to: "/about" },
    { label: "Careers", to: "/careers" },
    { label: "Sustainability", to: "/sustainability" },
  ],
};

const FALLBACK_TAGLINE = "Crafting timeless menswear for the modern gentleman since 2018. Every piece tells a story of quality and refinement.";

const Footer = () => {
  const { data } = useSiteSettings();
  const tagline = data?.brandTagline || FALLBACK_TAGLINE;

  return (
    <footer className="section-padding py-16 md:py-20 border-t border-border">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="font-display text-2xl font-light tracking-[0.2em] text-foreground uppercase block mb-4">
            Maison
          </Link>
          <p className="font-body text-xs text-muted-foreground leading-relaxed max-w-xs">
            {tagline}
          </p>
        </div>

        {/* Links */}
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h4 className="font-body text-xs tracking-[0.2em] uppercase text-foreground mb-6">
              {title}
            </h4>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="font-body text-xs text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-body text-[10px] tracking-[0.1em] text-muted-foreground">
          © {new Date().getFullYear()} MAISON. All rights reserved.
        </p>
        <div className="flex gap-6">
          {[
            { label: "Instagram", href: "https://www.instagram.com/invites/contact/?utm_source=ig_contact_invite&utm_medium=copy_link&utm_content=tny9czk" },
            { label: "Facebook", href: "https://www.facebook.com/share/18Jk6bpmDe/" },
            { label: "YouTube", href: "https://www.youtube.com/@SLOWMOTION-Cr7" },
          ].map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              {social.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
