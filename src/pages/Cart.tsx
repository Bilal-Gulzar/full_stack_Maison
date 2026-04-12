import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Minus, Plus, X } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { formatPrice } from "@/lib/currency";
import { useShippingSettings, computeShipping } from "@/hooks/useShippingSettings";

const Cart = () => {
  usePageMeta({ title: "Cart", description: "Review the pieces in your MAISON shopping bag." });
  const { items, updateQuantity, removeItem, totalPrice } = useCart();
  const { settings: shippingSettings } = useShippingSettings();
  // Cart shows the COD shipping estimate (worst case, since payment is chosen at checkout).
  const ship = computeShipping(totalPrice, "cod", shippingSettings);
  const grandTotal = totalPrice + ship.total;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 md:pt-24">
        <div className="section-padding py-12 md:py-20 border-b border-border">
          <h1 className="font-display text-4xl md:text-6xl font-light text-foreground">Shopping Bag</h1>
        </div>

        <div className="section-padding py-12 md:py-20">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-body text-muted-foreground mb-6">Your bag is empty</p>
              <Link
                to="/shop"
                className="inline-block bg-primary text-primary-foreground px-8 py-3 text-xs font-body tracking-[0.2em] uppercase hover:bg-accent/90 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Items */}
              <div className="lg:col-span-2 space-y-6">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-4 md:gap-6 border-b border-border pb-6">
                    <Link to={`/product/${item.product.id}`} className="w-24 md:w-32 aspect-[4/5] bg-secondary flex-shrink-0 overflow-hidden">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-display text-lg text-foreground">{item.product.name}</h3>
                            <p className="text-[10px] font-body tracking-[0.15em] uppercase text-muted-foreground mt-1">
                              {item.size} · {item.color}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.product.id, item.size, item.color)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center border border-border">
                          <button onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground">
                            <Minus size={12} />
                          </button>
                          <span className="w-8 h-8 flex items-center justify-center font-body text-xs text-foreground">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground">
                            <Plus size={12} />
                          </button>
                        </div>
                        <p className="font-body text-sm text-primary">{formatPrice(item.product.price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="bg-card border border-border p-6 md:p-8 h-fit">
                <h3 className="font-display text-xl text-foreground mb-6">Order Summary</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-foreground">{ship.baseShipping === 0 ? "Free" : formatPrice(ship.baseShipping)}</span>
                  </div>
                  {ship.codSurcharge > 0 && (
                    <div className="flex justify-between font-body text-sm">
                      <span className="text-muted-foreground">COD Surcharge</span>
                      <span className="text-foreground">{formatPrice(ship.codSurcharge)}</span>
                    </div>
                  )}
                  {shippingSettings.freeShippingThreshold > 0 && totalPrice < shippingSettings.freeShippingThreshold && (
                    <p className="font-body text-[10px] text-muted-foreground/70 italic">
                      Add {formatPrice(shippingSettings.freeShippingThreshold - totalPrice)} more for free shipping.
                    </p>
                  )}
                </div>
                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between font-body">
                    <span className="text-foreground text-sm uppercase tracking-wider">Total</span>
                    <span className="text-primary text-lg">{formatPrice(grandTotal)}</span>
                  </div>
                </div>
                <Link
                  to="/checkout"
                  className="block w-full bg-primary text-primary-foreground py-3 text-xs font-body tracking-[0.2em] uppercase text-center hover:bg-accent/90 transition-colors"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  to="/shop"
                  className="block w-full text-center mt-3 text-xs font-body tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
