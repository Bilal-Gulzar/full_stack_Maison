import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check } from "lucide-react";
import { fetchOrderById } from "@/services/orders";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageMeta } from "@/hooks/usePageMeta";
import { formatPrice } from "@/lib/currency";

interface ConfirmationOrder {
  total: number;
  items: { title: string; price: number; quantity: number; size?: string; color?: string }[];
}

const OrderConfirmation = () => {
  usePageMeta({ title: "Order Confirmed", description: "Thank you for your MAISON order." });
  const { orderId } = useParams();
  const [order, setOrder] = useState<ConfirmationOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    fetchOrderById(orderId)
      .then((r: { total: number; items: ConfirmationOrder["items"] } | null) =>
        r ? setOrder({ total: r.total, items: r.items || [] }) : setOrder(null)
      )
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 md:pt-24 section-padding py-20 md:py-32">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <Skeleton className="w-16 h-16 mx-auto rounded-none" />
            <Skeleton className="h-12 w-48 mx-auto" />
            <Skeleton className="h-3 w-64 mx-auto" />
            <Skeleton className="h-3 w-40 mx-auto" />
            <div className="bg-card border border-border p-6 md:p-8 mt-8 space-y-4 text-left">
              <Skeleton className="h-5 w-32" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
              <div className="border-t border-border pt-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 md:pt-24 section-padding py-20 md:py-32">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6">
            <Check size={28} className="text-primary" />
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-light text-foreground mb-4">Thank You</h1>
          <p className="font-body text-muted-foreground mb-2">Your order has been placed successfully.</p>
          <p className="font-body text-xs tracking-[0.15em] uppercase text-primary mb-8">Order #{orderId}</p>

          {order && (
            <div className="bg-card border border-border p-6 md:p-8 text-left mb-8">
              <h3 className="font-display text-lg text-foreground mb-4">Order Details</h3>
              <div className="space-y-3 mb-6">
                {order.items?.map((item, i) => (
                  <div key={`${item.title}-${item.size}-${item.color}-${i}`} className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">
                      {item.title}{item.size || item.color ? ` (${[item.size, item.color].filter(Boolean).join(", ")})` : ""} × {item.quantity}
                    </span>
                    <span className="text-foreground">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between font-body">
                  <span className="text-sm uppercase tracking-wider text-foreground">Total</span>
                  <span className="text-primary text-lg">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <Link
              to="/shop"
              className="bg-primary text-primary-foreground px-8 py-3 text-xs font-body tracking-[0.2em] uppercase hover:bg-accent/90 transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              to="/"
              className="border border-border text-foreground px-8 py-3 text-xs font-body tracking-[0.2em] uppercase hover:border-primary hover:text-primary transition-colors"
            >
              Back Home
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
