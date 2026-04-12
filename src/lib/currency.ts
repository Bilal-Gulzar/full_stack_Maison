/**
 * Single source of truth for price formatting across the storefront.
 * Currency: Pakistani Rupee (PKR).
 */
export const CURRENCY_CODE = "PKR";
export const CURRENCY_SYMBOL = "Rs";

export function formatPrice(amount: number | null | undefined): string {
  const n = typeof amount === "number" && !Number.isNaN(amount) ? amount : 0;
  return `${CURRENCY_SYMBOL} ${n.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}
