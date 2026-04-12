import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, ShoppingBag, User, Heart, Sun, Moon, ChevronDown, ChevronRight, LogOut } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import SearchOverlay from "@/components/SearchOverlay";
import { easternCategories } from "@/lib/filterOptions";
import { AnimatePresence, motion } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [expandedSub, setExpandedSub] = useState<string | null>(null);
  const { totalItems } = useCart();
  const { user, logout, isLoggingOut } = useAuth();
  const { totalItems: wishlistTotal } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const navLinks = [
    { label: "New Arrivals", to: "/shop?filter=new" },
    { label: "Shop", to: "/shop", hasMenu: true },
    { label: "Orders", to: "/orders" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ];

  const shopCategories = [
    {
      label: "EASTERN WEAR",
      highlight: true,
      children: [
        {
          label: "Stitched",
          children: easternCategories.stitched.subcategories.map((s) => ({
            label: s.label,
            to: `/shop?wear=eastern&type=stitched&sub=${s.value}`,
          })),
        },
        {
          label: "Unstitched",
          children: easternCategories.unstitched.subcategories.map((s) => ({
            label: s.label,
            to: `/shop?wear=eastern&type=unstitched&sub=${s.value}`,
          })),
        },
      ],
    },
    {
      label: "WESTERN WEAR",
      highlight: false,
      to: "/shop?wear=western",
      children: [
        { label: "Knitwear", to: "/shop?wear=western&cat=Knitwear" },
        { label: "Trousers", to: "/shop?wear=western&cat=Trousers" },
        { label: "Shirts", to: "/shop?wear=western&cat=Shirts" },
        { label: "Footwear", to: "/shop?wear=western&cat=Footwear" },
        { label: "Outerwear", to: "/shop?wear=western&cat=Outerwear" },
      ],
    },
    { label: "NEW ARRIVALS", highlight: true, to: "/shop?filter=new" },
  ];

  return (
    <>
      {/* Logout overlay */}
      <AnimatePresence>
        {isLoggingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-background flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full mx-auto mb-6"
              />
              <p className="font-display text-2xl text-foreground mb-2">Signing Out</p>
              <p className="font-body text-sm text-muted-foreground">See you soon...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed top-0 left-0 right-0 z-[100] bg-background/80 backdrop-blur-md border-b border-border">
        <div className="section-padding flex items-center justify-between h-16 md:h-20">
          <button
            onClick={(e) => { e.stopPropagation(); setIsOpen((prev) => !prev); }}
            className="md:hidden text-foreground relative z-[60]"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link to="/" className="flex items-center">
            <img
              src="/maison-logo-dark.svg"
              alt="MAISON"
              className="h-10 md:h-12 w-auto block dark:hidden"
            />
            <img
              src="/maison-logo-light.svg"
              alt="MAISON"
              className="h-10 md:h-12 w-auto hidden dark:block"
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.label} to={link.to} className="text-xs font-body tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 line-accent">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <button onClick={toggleTheme} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Toggle theme">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => setSearchOpen(true)} className="text-muted-foreground hover:text-foreground transition-colors">
              <Search size={18} />
            </button>
            {user ? (
              <button onClick={handleLogout} className="hidden md:block text-muted-foreground hover:text-foreground transition-colors">
                <LogOut size={18} />
              </button>
            ) : (
              <Link to="/login" className="hidden md:block text-muted-foreground hover:text-foreground transition-colors">
                <User size={18} />
              </Link>
            )}
            <Link to="/wishlist" className="text-muted-foreground hover:text-foreground transition-colors relative">
              <Heart size={18} />
              {wishlistTotal > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-body flex items-center justify-center">
                  {wishlistTotal}
                </span>
              )}
            </Link>
            <Link to="/cart" className="text-muted-foreground hover:text-foreground transition-colors relative">
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-body flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Outside nav to avoid stacking context from backdrop-blur */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="md:hidden fixed inset-0 top-16 z-[99] bg-background overflow-y-auto"
          >
            <div className="section-padding py-4">
              {/* Search in menu */}
              <button
                onClick={() => { setSearchOpen(true); setIsOpen(false); }}
                className="w-full flex items-center justify-between py-3 px-4 border border-border mb-6 text-muted-foreground"
              >
                <span className="font-body text-sm">Search</span>
                <Search size={18} />
              </button>

              {/* Shop categories */}
              {shopCategories.map((cat) => (
                <div key={cat.label} className="border-b border-border">
                  {cat.children ? (
                    <>
                      <button
                        onClick={() => setExpandedMenu(expandedMenu === cat.label ? null : cat.label)}
                        className={`w-full flex items-center justify-between py-4 text-sm font-body tracking-[0.15em] uppercase transition-colors ${
                          cat.highlight ? "text-primary font-medium" : "text-foreground"
                        }`}
                      >
                        {cat.label}
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-200 ${expandedMenu === cat.label ? "rotate-180" : ""}`}
                        />
                      </button>
                      <AnimatePresence>
                        {expandedMenu === cat.label && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pb-4 pl-4">
                              {Array.isArray(cat.children) && cat.children.map((sub: any) => (
                                <div key={sub.label}>
                                  {sub.children ? (
                                    <>
                                      <button
                                        onClick={() => setExpandedSub(expandedSub === sub.label ? null : sub.label)}
                                        className="w-full flex items-center justify-between py-3 text-xs font-body tracking-[0.15em] uppercase text-foreground"
                                      >
                                        {sub.label}
                                        <ChevronRight
                                          size={14}
                                          className={`transition-transform duration-200 ${expandedSub === sub.label ? "rotate-90" : ""}`}
                                        />
                                      </button>
                                      <AnimatePresence>
                                        {expandedSub === sub.label && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden pl-4"
                                          >
                                            {sub.children.map((item: any) => (
                                              <Link
                                                key={item.label}
                                                to={item.to}
                                                onClick={() => setIsOpen(false)}
                                                className="block py-2.5 text-xs font-body tracking-wider text-muted-foreground hover:text-primary transition-colors"
                                              >
                                                {item.label}
                                              </Link>
                                            ))}
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </>
                                  ) : (
                                    <Link
                                      to={sub.to}
                                      onClick={() => setIsOpen(false)}
                                      className="block py-3 text-xs font-body tracking-[0.1em] uppercase text-muted-foreground hover:text-primary transition-colors"
                                    >
                                      {sub.label}
                                    </Link>
                                  )}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      to={cat.to || "/shop"}
                      onClick={() => setIsOpen(false)}
                      className={`block py-4 text-sm font-body tracking-[0.15em] uppercase transition-colors ${
                        cat.highlight ? "text-primary font-medium" : "text-foreground"
                      }`}
                    >
                      {cat.label}
                    </Link>
                  )}
                </div>
              ))}

              {/* Other nav links */}
              <div className="mt-6 space-y-0">
                {[
                  { label: "Orders", to: "/orders" },
                  { label: "About", to: "/about" },
                  { label: "Contact", to: "/contact" },
                  { label: "Articles", to: "/articles" },
                ].map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className="block py-4 text-sm font-body tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors border-b border-border"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Auth */}
              <div className="mt-6">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 py-4 text-sm font-body tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 py-4 text-sm font-body tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <User size={16} /> Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;
