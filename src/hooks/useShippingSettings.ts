import { useEffect, useState } from "react";
import { sanityClient } from "@/lib/sanity";

export interface ShippingSettings {
  standardFee: number;
  freeShippingThreshold: number;
  codSurcharge: number;
  deliveryDaysMin: number;
  deliveryDaysMax: number;
  shippingNote?: string;
}

const FALLBACK: ShippingSettings = {
  standardFee: 250,
  freeShippingThreshold: 5000,
  codSurcharge: 0,
  deliveryDaysMin: 3,
  deliveryDaysMax: 7,
};

const QUERY = `*[_type=="shippingSettings"][0]{
  standardFee,
  freeShippingThreshold,
  codSurcharge,
  deliveryDaysMin,
  deliveryDaysMax,
  shippingNote
}`;

export function useShippingSettings() {
  const [settings, setSettings] = useState<ShippingSettings>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    sanityClient
      .fetch<ShippingSettings | null>(QUERY)
      .then((data) => {
        if (cancelled) return;
        if (data) setSettings({ ...FALLBACK, ...data });
      })
      .catch(() => {
        // keep fallback
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return { settings, loading };
}

/**
 * Compute shipping breakdown given subtotal + payment method.
 * - baseShipping: 0 when subtotal >= free threshold, else standardFee
 * - codSurcharge: only when paymentMethod === "cod"
 * - total: sum of both
 */
export function computeShipping(
  subtotal: number,
  paymentMethod: "card" | "cod",
  s: ShippingSettings
): { baseShipping: number; codSurcharge: number; total: number } {
  const baseShipping = s.freeShippingThreshold > 0 && subtotal >= s.freeShippingThreshold ? 0 : s.standardFee;
  const codSurcharge = paymentMethod === "cod" ? s.codSurcharge : 0;
  return { baseShipping, codSurcharge, total: baseShipping + codSurcharge };
}

export function formatDeliveryEstimate(s: ShippingSettings): string {
  if (s.deliveryDaysMin === s.deliveryDaysMax) return `${s.deliveryDaysMin} business days`;
  return `${s.deliveryDaysMin}–${s.deliveryDaysMax} business days`;
}

/**
 * Build the shipping message shown to customers. Auto-prepends a free-shipping
 * line when freeShippingThreshold > 0, then appends the admin's free-text note.
 * Returns null when there is nothing to show.
 */
export function buildShippingMessage(s: ShippingSettings): string | null {
  const parts: string[] = [];
  if (s.freeShippingThreshold > 0) {
    parts.push(`Free shipping on orders over Rs ${s.freeShippingThreshold.toLocaleString("en-PK")}.`);
  }
  if (s.shippingNote && s.shippingNote.trim()) {
    parts.push(s.shippingNote.trim());
  }
  return parts.length ? parts.join(" ") : null;
}
