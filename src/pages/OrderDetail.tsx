import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Package, MapPin, CreditCard, Banknote, XCircle, Copy, Check } from "lucide-react";
import { fetchOrderById, cancelOrder } from "@/services/orders";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { usePageMeta } from "@/hooks/usePageMeta";
import { formatPrice } from "@/lib/currency";
import ProductThumb from "@/components/ProductThumb";

const CANCELLABLE_STATUSES = new Set(["pending"]);

interface Order {
  id: string;
  items: { title: string; price: number; quantity: number; size?: string; color?: string; image?: string }[];
  subtotal?: number;
  shippingFee?: number;
  codSurcharge?: number;
  total: number;
  date: string;
  shipping: Record<string, string | undefined>;
  paymentMethod: string;
  status: string;
}

const steps = ["confirmed", "processing", "shipped", "delivered"];

const OrderDetail = () => {
  const { orderId } = useParams();
  usePageMeta({ title: orderId ? `Order #${orderId.slice(-6).toUpperCase()}` : "Order", description: "View your MAISON order details." });
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!order) return;
    const orderNo = order.id.slice(-8).toUpperCase();
    navigator.clipboard.writeText(orderNo).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCancel = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      await cancelOrder(order.id, cancelReason);
      setOrder({ ...order, status: "cancelled" });
      setCancelReason("");
      toast.success("Order cancelled. A confirmation email is on the way.");
    } catch (err) {
      toast.error((err as Error).message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    fetchOrderById(orderId)
      .then((r: { _id: string; items: Order["items"]; subtotal?: number; shippingFee?: number; codSurcharge?: number; total: number; createdAt: string; shippingAddress?: Record<string, string>; paymentMethod: string; status: string } | null) => {
        if (!r) return setOrder(null);
        setOrder({
          id: r._id,
          items: r.items || [],
          subtotal: r.subtotal,
          shippingFee: r.shippingFee,
          codSurcharge: r.codSurcharge,
          total: r.total,
          date: r.createdAt,
          shipping: r.shippingAddress || {},
          paymentMethod: r.paymentMethod,
          status: r.status,
        });
      })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 md:pt-24 section-padding py-16 md:py-24">
          <div className="max-w-3xl mx-auto space-y-6">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-3 w-40" />
            <div className="border border-border bg-card p-6 md:p-8 space-y-4 mt-6">
              <Skeleton className="h-5 w-32" />
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-2 w-full" />
                ))}
              </div>
            </div>
            <div className="border border-border bg-card p-6 md:p-8 space-y-4">
              <Skeleton className="h-5 w-32" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <Skeleton className="w-16 h-20" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-border bg-card p-6 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <div className="border border-border bg-card p-6 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 md:pt-24 section-padding py-20 text-center">
          <Package size={48} className="text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-body text-muted-foreground mb-6">Order not found</p>
          <Link to="/orders" className="text-xs font-body tracking-[0.15em] uppercase text-primary hover:underline">
            View All Orders
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const currentStep = steps.indexOf(order.status);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 md:pt-24 section-padding py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          {/* Back */}
          <Link to="/orders" className="inline-flex items-center gap-2 text-xs font-body tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft size={14} /> All Orders
          </Link>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl md:text-4xl font-light text-foreground">
                  #{order.id.slice(-8).toUpperCase()}
                </h1>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded transition-colors"
                  title="Copy order number"
                >
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
              <p className="font-body text-sm text-muted-foreground mt-1">
                Placed on {new Date(order.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div className="flex items-center gap-3 self-start">
              <span className={`text-xs font-body tracking-[0.15em] uppercase border px-3 py-1 ${
                order.status === "cancelled"
                  ? "bg-destructive/10 text-destructive border-destructive/30"
                  : "bg-primary/10 text-primary border-primary/30"
              }`}>
                {order.status}
              </span>
              {CANCELLABLE_STATUSES.has(order.status) && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 text-xs font-body tracking-[0.15em] uppercase bg-destructive/10 text-destructive border border-destructive/30 px-3 py-1 hover:bg-destructive/20 transition-colors"
                    >
                      <XCircle size={14} /> Cancel Order
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will cancel your order and restock the items. You'll receive a confirmation email.
                        Cancellation is only possible while the order is pending. Once we confirm
                        and start preparing it, you'll need to contact support.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-2">
                      <label className="block text-xs font-body tracking-[0.15em] uppercase text-muted-foreground mb-2">
                        Reason (optional)
                      </label>
                      <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        rows={3}
                        maxLength={500}
                        placeholder="Changed my mind, wrong size, found it cheaper…"
                        className="w-full bg-background border border-border px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={cancelling}>Keep Order</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {cancelling ? "Cancelling…" : "Yes, Cancel Order"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="border border-border bg-card p-6 mb-6">
            <h3 className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-4">Order Progress</h3>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-3 left-0 right-0 h-px bg-border" />
              <div
                className="absolute top-3 left-0 h-px bg-primary transition-all"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              />
              {steps.map((step, i) => (
                <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-body ${
                    i <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border border-border"
                  }`}>
                    {i + 1}
                  </div>
                  <span className={`text-[10px] font-body tracking-wider uppercase ${
                    i <= currentStep ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Items */}
          <div className="border border-border bg-card p-6 mb-6">
            <h3 className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-4">Items</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex flex-col">
                  <ProductThumb src={item.image} alt={item.title} className="w-full aspect-[4/5]" />
                  <p className="font-body text-xs text-foreground mt-2 line-clamp-1">{item.title}</p>
                  <p className="font-body text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                    {[item.size, item.color].filter(Boolean).join(" · ")} · Qty {item.quantity}
                  </p>
                  <p className="font-body text-xs text-primary mt-1">{formatPrice((item.price ?? 0) * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-4 pt-4 space-y-2">
              {(() => {
                const computedSubtotal = order.items.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0);
                const subtotal = order.subtotal ?? computedSubtotal;
                const baseShipping = order.shippingFee ?? Math.max(0, order.total - computedSubtotal);
                const codSurcharge = order.codSurcharge ?? 0;
                return (
                  <>
                    <div className="flex justify-between font-body text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between font-body text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-foreground">{baseShipping === 0 ? "Free" : formatPrice(baseShipping)}</span>
                    </div>
                    {codSurcharge > 0 && (
                      <div className="flex justify-between font-body text-sm">
                        <span className="text-muted-foreground">COD Surcharge</span>
                        <span className="text-foreground">{formatPrice(codSurcharge)}</span>
                      </div>
                    )}
                    <div className="border-t border-border pt-3 mt-3 flex justify-between">
                      <span className="font-body text-sm uppercase tracking-wider text-foreground">Total</span>
                      <span className="font-body text-lg text-primary">{formatPrice(order.total)}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Shipping & Payment */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={14} className="text-muted-foreground" />
                <h3 className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground">Shipping Address</h3>
              </div>
              <div className="font-body text-sm text-foreground space-y-0.5">
                <p>{order.shipping?.firstName} {order.shipping?.lastName}</p>
                <p className="text-muted-foreground">{order.shipping?.address}</p>
                <p className="text-muted-foreground">{order.shipping?.city}, {order.shipping?.state} {order.shipping?.zip}</p>
                <p className="text-muted-foreground">{order.shipping?.country}</p>
              </div>
            </div>
            <div className="border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-3">
                {order.paymentMethod === "cod" ? <Banknote size={14} className="text-muted-foreground" /> : <CreditCard size={14} className="text-muted-foreground" />}
                <h3 className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground">Payment Method</h3>
              </div>
              <p className="font-body text-sm text-foreground">
                {order.paymentMethod === "cod" ? "Cash on Delivery" : "Credit Card"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderDetail;
