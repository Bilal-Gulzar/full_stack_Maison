import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ScrollToTop from "@/components/ScrollToTop";
import WhatsAppButton from "@/components/WhatsAppButton";
import Index from "./pages/Index.tsx";
import Shop from "./pages/Shop.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import Cart from "./pages/Cart.tsx";
import Checkout from "./pages/Checkout.tsx";
import OrderConfirmation from "./pages/OrderConfirmation.tsx";
import Orders from "./pages/Orders.tsx";
import OrderDetail from "./pages/OrderDetail.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import Articles from "./pages/Articles.tsx";
import ArticleDetail from "./pages/ArticleDetail.tsx";
import Wishlist from "./pages/Wishlist.tsx";
import ShippingReturns from "./pages/ShippingReturns.tsx";
import FAQ from "./pages/FAQ.tsx";
import Sustainability from "./pages/Sustainability.tsx";
import Careers from "./pages/Careers.tsx";
import NotFound from "./pages/NotFound.tsx";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./auth/ProtectedRoute";
const StudioPage = lazy(() => import("./pages/Studio.tsx"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <AuthProvider>
      <WishlistProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              {/* Signup removed — OTP-based login only */}
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/article/:slug" element={<ArticleDetail />} />
              <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
              <Route
                path="/studio/*"
                element={
                  <Suspense fallback={<div style={{ padding: 40 }}>Loading Studio…</div>}>
                    <StudioPage />
                  </Suspense>
                }
              />
              <Route path="/shipping-returns" element={<ShippingReturns />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/sustainability" element={<Sustainability />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <WhatsAppButton />
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
      </WishlistProvider>
    </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
