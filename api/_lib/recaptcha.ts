/**
 * Google reCAPTCHA v2 ("I'm not a robot" checkbox) verifier (server-side).
 * No-op when RECAPTCHA_SECRET is not set, so the app keeps working without keys.
 */
export async function verifyRecaptcha(
  token: string | undefined,
  _action?: string
): Promise<{ ok: boolean; reason?: string }> {
  const secret = process.env.RECAPTCHA_SECRET;
  if (!secret) {
    // No keys configured — accept silently (dev mode)
    return { ok: true };
  }
  if (!token) return { ok: true }; // No token = widget didn't load, allow through

  try {
    const params = new URLSearchParams({ secret, response: token });
    const r = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });
    const data = (await r.json()) as { success: boolean; "error-codes"?: string[] };
    if (!data.success) {
      return { ok: false, reason: data["error-codes"]?.join(",") || "verify failed" };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: (e as Error).message };
  }
}
