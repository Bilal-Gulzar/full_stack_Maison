import crypto from "crypto";
import { wrap, json, readJsonBody } from "../_lib/http";
import { sanityServer } from "../_lib/sanityServer";
import { sendOtpEmail } from "../_lib/email";
import { validateEmail } from "../_lib/emailValidator";

const hash = (code: string) =>
  crypto.createHash("sha256").update(code + (process.env.JWT_SECRET || "")).digest("hex");

// Rate limiting config
const MAX_OTPS_PER_WINDOW = 5;
const WINDOW_HOURS = 24;
const LOCKOUT_HOURS = 4;

// Deterministic doc id per email so we can fetch/upsert without an extra query
const rateLimitId = (email: string) =>
  `rate.${crypto.createHash("sha1").update(email).digest("hex").slice(0, 24)}`;

interface RateLimitDoc {
  _id: string;
  attempts?: number;
  windowStart?: string;
  lockedUntil?: string;
}

export default wrap(async (req, res) => {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  const body = await readJsonBody(req);
  const email = String(body.email || "").trim().toLowerCase();
  const validation = await validateEmail(email);
  if (!validation.ok) return json(res, 400, { error: validation.reason || "Invalid email" });

  const now = new Date();
  const nowMs = now.getTime();

  // ---- Rate limit check ----
  const limitId = rateLimitId(email);
  const limit = await sanityServer.fetch<RateLimitDoc | null>(
    `*[_type=="otpRateLimit" && _id==$id][0]{_id, attempts, windowStart, lockedUntil}`,
    { id: limitId }
  );

  if (limit?.lockedUntil && new Date(limit.lockedUntil).getTime() > nowMs) {
    const retryAfterSec = Math.ceil((new Date(limit.lockedUntil).getTime() - nowMs) / 1000);
    const hoursLeft = Math.ceil(retryAfterSec / 3600);
    res.setHeader("Retry-After", String(retryAfterSec));
    return json(res, 429, {
      error: `Too many OTP requests. Please try again in ${hoursLeft} hour${hoursLeft === 1 ? "" : "s"}.`,
      lockedUntil: limit.lockedUntil,
    });
  }

  // Determine current rolling window
  const windowMs = WINDOW_HOURS * 60 * 60 * 1000;
  const inWindow =
    limit?.windowStart && nowMs - new Date(limit.windowStart).getTime() < windowMs;
  const currentAttempts = inWindow ? limit?.attempts || 0 : 0;

  if (currentAttempts >= MAX_OTPS_PER_WINDOW) {
    // Trip the lockout
    const lockedUntil = new Date(nowMs + LOCKOUT_HOURS * 60 * 60 * 1000).toISOString();
    await sanityServer.createOrReplace({
      _id: limitId,
      _type: "otpRateLimit",
      email,
      attempts: currentAttempts,
      windowStart: limit?.windowStart || now.toISOString(),
      lockedUntil,
    });
    res.setHeader("Retry-After", String(LOCKOUT_HOURS * 3600));
    return json(res, 429, {
      error: `OTP limit reached (${MAX_OTPS_PER_WINDOW} per ${WINDOW_HOURS}h). Please try again in ${LOCKOUT_HOURS} hours.`,
      lockedUntil,
    });
  }

  // ---- Generate + send OTP ----
  const code = ("" + Math.floor(100000 + Math.random() * 900000)).slice(0, 6);
  const TTL_MINUTES = 10;
  const expiresAt = new Date(nowMs + TTL_MINUTES * 60 * 1000).toISOString();
  const nowIso = now.toISOString();

  // Lazy GC of expired tokens + clear any prior OTP for this email
  await sanityServer.delete({
    query: `*[_type=="otpToken" && (expiresAt < $now || email==$email)]`,
    params: { now: nowIso, email },
  });

  await sanityServer.create({
    _type: "otpToken",
    email,
    codeHash: hash(code),
    expiresAt,
    attempts: 0,
  });

  try {
    await sendOtpEmail(email, code);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[otp-send] email failed", e);
    return json(res, 502, { error: "Failed to send email" });
  }

  // ---- Persist updated rate-limit counter ----
  await sanityServer.createOrReplace({
    _id: limitId,
    _type: "otpRateLimit",
    email,
    attempts: currentAttempts + 1,
    windowStart: inWindow ? limit?.windowStart : nowIso,
    // explicit clear of any stale lock (the if-locked branch above already returned)
    lockedUntil: undefined,
  });

  json(res, 200, {
    ok: true,
    remaining: MAX_OTPS_PER_WINDOW - (currentAttempts + 1),
  });
});
