import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { CreditCard, Banknote } from "lucide-react";
import { createOrder } from "@/services/orders";
import { usePageMeta } from "@/hooks/usePageMeta";
import { formatPrice } from "@/lib/currency";
import { validatePhone } from "@/lib/phone";
import { useShippingSettings, computeShipping, formatDeliveryEstimate, buildShippingMessage } from "@/hooks/useShippingSettings";

const Checkout = () => {
  usePageMeta({ title: "Checkout", description: "Complete your MAISON order — fast, secure checkout." });
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { settings: shippingSettings } = useShippingSettings();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("cod");
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "", zip: "", country: "",
    cardNumber: "", expiry: "", cvv: "", cardName: "",
  });

  // Prefill email (and name when available) from the logged-in user
  useEffect(() => {
    if (user?.email) {
      setForm((f) => ({
        ...f,
        email: user.email,
        firstName: f.firstName || (user.name?.split(" ")[0] ?? ""),
        lastName: f.lastName || (user.name?.split(" ").slice(1).join(" ") ?? ""),
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your bag is empty");
      return;
    }
    if (paymentMethod === "card") {
      toast.error("Online card payment is coming soon — please choose Cash on Delivery");
      return;
    }

    // Validate phone (format + country, defaults to PK)
    const phoneCheck = validatePhone(form.phone);
    if (!phoneCheck.ok) {
      toast.error(phoneCheck.reason || "Invalid phone number");
      return;
    }

    setPlacing(true);
    try {
      const { orderId } = await createOrder({
        items: items.map((i) => ({
          productId: i.product.id,
          title: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          size: i.size,
          color: i.color,
        })),
        paymentMethod,
        shippingAddress: {
          fullName: `${form.firstName} ${form.lastName}`.trim(),
          phone: phoneCheck.e164 || form.phone,
          line1: form.address,
          city: form.city,
          state: form.state,
          postalCode: form.zip,
          country: form.country,
        },
      });
      clearCart();
      toast.success("Order placed!");
      navigate(`/order-confirmation/${orderId}`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setPlacing(false);
    }
  };

  const inputClasses = "w-full bg-background border border-border px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors";

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 md:pt-24 section-padding py-20 text-center">
          <h1 className="font-display text-3xl text-foreground mb-4">Your bag is empty</h1>
          <Link to="/shop" className="text-primary font-body text-sm underline">Continue Shopping</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 md:pt-24">
        <div className="section-padding py-12 md:py-16 border-b border-border">
          <h1 className="font-display text-4xl md:text-6xl font-light text-foreground">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit} className="section-padding py-12 md:py-20">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-10">
              {/* Shipping */}
              <div>
                <h3 className="font-display text-xl text-foreground mb-6">Shipping Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required className={inputClasses} />
                  <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required className={inputClasses} />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    readOnly={!!user?.email}
                    className={`${inputClasses} col-span-2 ${user?.email ? "bg-secondary/40 cursor-not-allowed text-muted-foreground" : ""}`}
                  />
                  <input name="phone" type="tel" placeholder="Phone (e.g. 0317 1234567 or +92 317 1234567)" value={form.phone} onChange={handleChange} required className={`${inputClasses} col-span-2`} />
                  <input name="address" placeholder="Address" value={form.address} onChange={handleChange} required className={`${inputClasses} col-span-2`} />
                  <input name="city" placeholder="City" value={form.city} onChange={handleChange} required className={inputClasses} />
                  <input name="state" placeholder="State" value={form.state} onChange={handleChange} required className={inputClasses} />
                  <input name="zip" placeholder="ZIP Code" value={form.zip} onChange={handleChange} required className={inputClasses} />
                  <input name="country" placeholder="Country" value={form.country} onChange={handleChange} required className={inputClasses} />
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <h3 className="font-display text-xl text-foreground mb-6">Payment Method</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`flex items-center gap-3 p-4 border transition-colors duration-300 ${
                      paymentMethod === "card"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-foreground/30"
                    }`}
                  >
                    <CreditCard size={20} className={paymentMethod === "card" ? "text-primary" : "text-muted-foreground"} />
                    <div className="text-left">
                      <p className={`text-xs font-body tracking-wider uppercase ${paymentMethod === "card" ? "text-primary" : "text-foreground"}`}>
                        Credit / Debit Card
                      </p>
                      <p className="text-[10px] font-body text-muted-foreground mt-0.5">Pay securely with card</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cod")}
                    className={`flex items-center gap-3 p-4 border transition-colors duration-300 ${
                      paymentMethod === "cod"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-foreground/30"
                    }`}
                  >
                    <Banknote size={20} className={paymentMethod === "cod" ? "text-primary" : "text-muted-foreground"} />
                    <div className="text-left">
                      <p className={`text-xs font-body tracking-wider uppercase ${paymentMethod === "cod" ? "text-primary" : "text-foreground"}`}>
                        Cash on Delivery
                      </p>
                      <p className="text-[10px] font-body text-muted-foreground mt-0.5">Pay when you receive</p>
                    </div>
                  </button>
                </div>

                {/* Card details — disabled while online payments are in progress */}
                {paymentMethod === "card" && (
                  <div className="animate-fade-in space-y-4">
                    <div className="bg-secondary/50 border-l-2 border-primary p-4">
                      <p className="font-body text-xs text-muted-foreground leading-relaxed">
                        Online card payment is currently in progress and will be available soon. For now, please complete your order with <strong className="text-foreground">Cash on Delivery</strong> — pay with cash when your order is delivered to your doorstep. A confirmation call will be made before delivery.
                      </p>
                    </div>
                    <fieldset disabled className="grid grid-cols-2 gap-4 opacity-50 cursor-not-allowed">
                      <input name="cardName" placeholder="Name on Card" value={form.cardName} onChange={handleChange} className={`${inputClasses} col-span-2`} />
                      <input name="cardNumber" placeholder="Card Number" value={form.cardNumber} onChange={handleChange} maxLength={19} className={`${inputClasses} col-span-2`} />
                      <input name="expiry" placeholder="MM / YY" value={form.expiry} onChange={handleChange} maxLength={7} className={inputClasses} />
                      <input name="cvv" placeholder="CVV" value={form.cvv} onChange={handleChange} maxLength={4} className={inputClasses} />
                    </fieldset>
                  </div>
                )}

                {paymentMethod === "cod" && (
                  <div className="bg-secondary/50 p-4 animate-fade-in">
                    <p className="font-body text-xs text-muted-foreground leading-relaxed">
                      Pay with cash when your order is delivered to your doorstep. Please ensure someone is available to receive and pay for the order. A confirmation call will be made before delivery.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order summary sidebar */}
            <div className="bg-card border border-border p-6 md:p-8 h-fit">
              <h3 className="font-display text-xl text-foreground mb-6">Your Order</h3>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-3">
                    <div className="w-14 aspect-[4/5] bg-secondary flex-shrink-0 overflow-hidden">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-body text-xs text-foreground">{item.product.name}</p>
                      <p className="font-body text-[10px] text-muted-foreground">{item.size} · {item.color} · Qty {item.quantity}</p>
                      <p className="font-body text-xs text-primary mt-1">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 mb-4">
                {(() => {
                  const ship = computeShipping(totalPrice, paymentMethod, shippingSettings);
                  return (
                    <>
                      <div className="flex justify-between font-body text-sm mb-2">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="text-foreground">{formatPrice(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between font-body text-sm mb-2">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="text-foreground">{ship.baseShipping === 0 ? "Free" : formatPrice(ship.baseShipping)}</span>
                      </div>
                      {ship.codSurcharge > 0 && (
                        <div className="flex justify-between font-body text-sm mb-2">
                          <span className="text-muted-foreground">COD Surcharge</span>
                          <span className="text-foreground">{formatPrice(ship.codSurcharge)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-body text-xs text-muted-foreground mb-2">
                        <span>Estimated delivery</span>
                        <span>{formatDeliveryEstimate(shippingSettings)}</span>
                      </div>
                      {(() => {
                        const msg = buildShippingMessage(shippingSettings);
                        return msg ? (
                          <p className="font-body text-[10px] text-muted-foreground italic mb-2">{msg}</p>
                        ) : null;
                      })()}
                    </>
                  );
                })()}
                <div className="flex justify-between font-body text-sm">
                  <span className="text-muted-foreground">Payment</span>
                  <span className="text-foreground">{paymentMethod === "cod" ? "Cash on Delivery" : "Card"}</span>
                </div>
              </div>
              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="font-body text-sm uppercase tracking-wider text-foreground">Total</span>
                  <span className="font-body text-lg text-primary">{formatPrice(totalPrice + computeShipping(totalPrice, paymentMethod, shippingSettings).total)}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={placing || paymentMethod === "card"}
                className="w-full bg-primary text-primary-foreground py-3 text-xs font-body tracking-[0.2em] uppercase hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placing ? "Placing order…" : paymentMethod === "card" ? "Card Payment Coming Soon" : "Place COD Order"}
              </button>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
