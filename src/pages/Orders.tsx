import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, ShoppingBag, ChevronDown, Filter } from "lucide-react";
import ProductThumb from "@/components/ProductThumb";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUserOrders } from "@/services/orders";
import { usePageMeta } from "@/hooks/usePageMeta";
import { formatPrice } from "@/lib/currency";

interface Order {
  id: string;
  items: { title: string; price: number; quantity: number; size?: string; color?: string; image?: string }[];
  total: number;
  date: string;
  paymentMethod: string;
  status: string;
}

const statusColors: Record<string, string> = {
  confirmed: "bg-primary/10 text-primary border-primary/30",
  processing: "bg-accent/10 text-accent-foreground border-accent/30",
  shipped: "bg-secondary text-secondary-foreground border-border",
  delivered: "bg-primary/20 text-primary border-primary/40",
};

const statusFilters = ["all", "confirmed", "processing", "shipped", "delivered"];

const sortOptions = [
  { label: "Newest First", value: "date-desc" },
  { label: "Oldest First", value: "date-asc" },
  { label: "Total: High to Low", value: "total-desc" },
  { label: "Total: Low to High", value: "total-asc" },
  { label: "Status", value: "status" },
];

const OrderSkeleton = () => (
  <div className="border border-border bg-card overflow-hidden">
    <div className="p-5 md:p-6 flex items-center gap-5">
      <Skeleton className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-3 w-32 max-w-full" />
        <Skeleton className="h-3 w-40 max-w-full" />
      </div>
      <Skeleton className="w-5 h-5 flex-shrink-0" />
    </div>
  </div>
);

const Orders = () => {
  usePageMeta({ title: "My Orders", description: "View your MAISON order history." });
  const [orders, setOrders] = useState<Order[]>([]);
  const [sortBy, setSortBy] = useState("date-desc");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showSort, setShowSort] = useState(false);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchUserOrders(user._id)
      .then((rows: Array<{ _id: string; items: Order["items"]; total: number; createdAt: string; paymentMethod: string; status: string }>) => {
        setOrders(
          rows.map((r) => ({
            id: r._id,
            items: r.items || [],
            total: r.total,
            date: r.createdAt,
            paymentMethod: r.paymentMethod,
            status: r.status,
          }))
        );
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user]);

  const sorted = useMemo(() => {
    let copy = [...orders];
    if (filterStatus !== "all") {
      copy = copy.filter((o) => o.status === filterStatus);
    }
    switch (sortBy) {
      case "date-asc": return copy.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case "date-desc": return copy.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case "total-asc": return copy.sort((a, b) => a.total - b.total);
      case "total-desc": return copy.sort((a, b) => b.total - a.total);
      case "status": return copy.sort((a, b) => a.status.localeCompare(b.status));
      default: return copy;
    }
  }, [orders, sortBy, filterStatus]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 md:pt-24 section-padding py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h1 className="font-display text-3xl md:text-5xl font-light text-foreground mb-2">My Orders</h1>
            <p className="font-body text-muted-foreground text-sm">Track and manage your orders</p>
          </div>

          {/* Filter & Sort Bar */}
          {orders.length > 0 && (
            <div className="flex flex-col gap-4 mb-8">
              {/* Status filter pills */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {statusFilters.map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 text-[11px] font-body tracking-[0.15em] uppercase whitespace-nowrap transition-all duration-200 border flex-shrink-0 ${
                      filterStatus === status
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    {status === "all" ? "All Orders" : status}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-body tracking-[0.15em] uppercase text-muted-foreground">
                  {sorted.length} order{sorted.length !== 1 ? "s" : ""}
                </p>
                <div className="relative">
                  <button
                    onClick={() => setShowSort(!showSort)}
                    className="flex items-center gap-2 text-xs font-body tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Sort
                    <ChevronDown size={14} className={`transition-transform ${showSort ? "rotate-180" : ""}`} />
                  </button>
                  {showSort && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowSort(false)} />
                      <div className="absolute right-0 top-full mt-2 bg-card border border-border py-2 min-w-[180px] z-20 shadow-lg">
                        {sortOptions.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                            className={`block w-full text-left px-4 py-2 text-xs font-body tracking-wider transition-colors ${
                              sortBy === opt.value ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <OrderSkeleton key={i} />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag size={48} className="text-muted-foreground/30 mx-auto mb-4" />
              <p className="font-body text-muted-foreground mb-6">You haven't placed any orders yet</p>
              <Link
                to="/shop"
                className="inline-block bg-primary text-primary-foreground px-8 py-3 text-xs font-body tracking-[0.2em] uppercase hover:bg-primary/90 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-20">
              <Filter size={48} className="text-muted-foreground/30 mx-auto mb-4" />
              <p className="font-body text-muted-foreground mb-4">No orders with status "{filterStatus}"</p>
              <button
                onClick={() => setFilterStatus("all")}
                className="text-primary font-body text-sm underline"
              >
                Show all orders
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sorted.map((order) => {
                const itemCount = order.items.reduce((s: number, i: any) => s + i.quantity, 0);
                const firstItem = order.items[0];
                return (
                  <Link
                    key={order.id}
                    to={`/orders/${order.id}`}
                    className="block border border-border bg-card hover:border-primary/40 transition-colors group"
                  >
                    <div className="p-4 md:p-6 flex items-center gap-3 md:gap-5 min-w-0">
                      <ProductThumb
                        src={firstItem?.image}
                        alt={firstItem?.title}
                        className="w-14 h-14 md:w-20 md:h-20 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 min-w-0">
                          <span className="font-body text-[11px] md:text-xs tracking-[0.12em] uppercase text-foreground truncate">
                            {order.id}
                          </span>
                          <span className={`text-[9px] md:text-[10px] font-body tracking-wider uppercase px-1.5 py-0.5 border whitespace-nowrap flex-shrink-0 ${statusColors[order.status] || statusColors.confirmed}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="font-body text-xs md:text-sm text-muted-foreground truncate">
                          {itemCount} {itemCount === 1 ? "item" : "items"} · {formatPrice(order.total)}
                        </p>
                        <p className="font-body text-[10px] md:text-xs text-muted-foreground/60 mt-0.5 truncate">
                          {new Date(order.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Orders;
