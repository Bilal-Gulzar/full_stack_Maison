/**
 * Server-side phone verification via Veriphone.io.
 * Free tier: 1,000 lookups/month. Get a key at https://veriphone.io
 *
 * No-op when VERIPHONE_API_KEY is unset (dev mode) — returns ok: true so the
 * order flow keeps working without the third-party dependency.
 */
export interface PhoneVerifyResult {
  ok: boolean;
  reason?: string;
  carrier?: string;
  country?: string;
  type?: string;
}

export async function verifyPhone(phoneE164: string | undefined): Promise<PhoneVerifyResult> {
  const key = process.env.VERIPHONE_API_KEY;
  if (!key) return { ok: true };
  if (!phoneE164) return { ok: false, reason: "Missing phone" };

  try {
    const url = `https://api.veriphone.io/v2/verify?phone=${encodeURIComponent(phoneE164)}&key=${key}`;
    const r = await fetch(url);
    if (!r.ok) return { ok: false, reason: `Veriphone HTTP ${r.status}` };
    const data = (await r.json()) as {
      status?: string;
      phone_valid?: boolean;
      phone_type?: string;
      carrier?: string;
      country?: string;
    };
    if (data.status !== "success") return { ok: false, reason: "Veriphone error" };
    if (!data.phone_valid) return { ok: false, reason: "Phone number is not valid" };
    return {
      ok: true,
      carrier: data.carrier,
      country: data.country,
      type: data.phone_type,
    };
  } catch (e) {
    // Network failure should not block checkout — log and let it through
    // eslint-disable-next-line no-console
    console.error("[veriphone] lookup failed", e);
    return { ok: true };
  }
}
