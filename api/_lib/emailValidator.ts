/**
 * Email validator — primary: Abstract API Email Reputation
 * (https://docs.abstractapi.com/api/email-reputation)
 *
 * Fallback: local hardcoded checks (format, disposable list, fake patterns, MX DNS lookup).
 * Fallback runs automatically when Abstract returns non-2xx, quota error, or network failure.
 *
 * Env: ABSTRACT_EMAIL_API_KEY
 */
import { promises as dns } from "node:dns";

const FORMAT_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const cache = new Map<string, { ok: boolean; reason?: string; ts: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000;

export interface ValidationResult {
  ok: boolean;
  reason?: string;
}

// ---------- Local fallback data ----------

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "10minutemail.com", "guerrillamail.com", "yopmail.com",
  "tempmail.com", "tempmail.net", "temp-mail.org", "throwawaymail.com",
  "getnada.com", "maildrop.cc", "sharklasers.com", "dispostable.com",
  "trashmail.com", "mohmal.com", "fakeinbox.com", "mintemail.com",
  "mytemp.email", "emailondeck.com", "mailnesia.com", "moakt.com",
  "tempr.email", "33mail.com", "spambox.us", "spam4.me",
  "mailcatch.com", "getairmail.com", "mailtemp.info", "tempmailo.com",
  "trbvm.com", "tempmailaddress.com", "luxusmail.org", "emailtemporanee.net",
  "jetable.org", "nowmymail.com", "tempail.com", "mailnull.com",
  "emlpro.com", "10mail.org", "tempinbox.com", "inboxkitten.com",
]);

const SUSPICIOUS_PATTERNS: RegExp[] = [
  /^(xx+|test+|fake|asdf+|qwerty|abcd+|1234+|zzz+|aaa+)$/i,
  /^(.)\1{2,}$/,          // 3+ of same char: aaa, 1111
  /^.{1,2}$/,             // 1–2 char usernames
  /^[a-z]{1,3}\d{1,3}$/i, // like ab12, xx1
];

const ROLE_ADDRESSES = new Set([
  "admin", "administrator", "postmaster", "hostmaster", "webmaster",
  "noreply", "no-reply", "donotreply", "mailer-daemon", "nobody",
]);

async function hasMxRecord(domain: string): Promise<boolean> {
  try {
    const records = await dns.resolveMx(domain);
    return Array.isArray(records) && records.length > 0;
  } catch {
    return false;
  }
}

async function manualValidate(email: string): Promise<ValidationResult> {
  if (!FORMAT_RE.test(email)) return { ok: false, reason: "Invalid email format" };

  const [user, domain] = email.split("@");

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { ok: false, reason: "Disposable email addresses are not allowed" };
  }

  if (ROLE_ADDRESSES.has(user)) {
    return { ok: false, reason: "Role-based email addresses are not allowed" };
  }

  for (const re of SUSPICIOUS_PATTERNS) {
    if (re.test(user)) return { ok: false, reason: "This email address looks invalid" };
  }

  const mx = await hasMxRecord(domain);
  if (!mx) return { ok: false, reason: "This email domain cannot receive messages" };

  return { ok: true };
}

// ---------- Abstract API ----------

interface ReputationResponse {
  email_deliverability?: {
    status?: "deliverable" | "undeliverable" | "risky" | "unknown";
    is_format_valid?: boolean;
    is_smtp_valid?: boolean;
    is_mx_valid?: boolean;
  };
  email_quality?: {
    score?: number;
    is_username_suspicious?: boolean;
    is_disposable?: boolean;
  };
  email_risk?: {
    address_risk_status?: "low" | "medium" | "high" | "unknown";
  };
  error?: { message?: string; code?: string };
}

export async function validateEmail(raw: string): Promise<ValidationResult> {
  const email = String(raw || "").trim().toLowerCase();

  if (!FORMAT_RE.test(email)) return { ok: false, reason: "Invalid email format" };

  const cached = cache.get(email);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.ok ? { ok: true } : { ok: false, reason: cached.reason };
  }

  const store = (result: ValidationResult) => {
    cache.set(email, { ...result, ts: Date.now() });
    return result;
  };

  const fallback = async (why: string) => {
    console.warn(`[emailValidator] Abstract fallback (${why}) — running local checks for ${email}`);
    const local = await manualValidate(email);
    return store(local);
  };

  const apiKey = process.env.ABSTRACT_EMAIL_API_KEY;
  if (!apiKey) return fallback("no API key");

  try {
    const url = `https://emailreputation.abstractapi.com/v1/?api_key=${apiKey}&email=${encodeURIComponent(email)}`;
    const res = await fetch(url);

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[emailValidator] Abstract API ${res.status}: ${body}`);
      return fallback(`HTTP ${res.status}`);
    }

    const data = (await res.json()) as ReputationResponse;

    if (data.error) {
      console.error("[emailValidator] Abstract API error:", data.error.message);
      return fallback(data.error.code || "api error");
    }

    const deliv = data.email_deliverability;
    const quality = data.email_quality;
    const risk = data.email_risk;

    console.log(`[emailValidator] ${email} →`, {
      status: deliv?.status,
      score: quality?.score,
      smtp: deliv?.is_smtp_valid,
      mx: deliv?.is_mx_valid,
      suspicious: quality?.is_username_suspicious,
      disposable: quality?.is_disposable,
      risk: risk?.address_risk_status,
    });

    if (deliv?.is_format_valid === false) return store({ ok: false, reason: "Invalid email format" });
    if (quality?.is_disposable === true) return store({ ok: false, reason: "Disposable email addresses are not allowed" });
    if (deliv?.is_mx_valid === false) return store({ ok: false, reason: "This email domain cannot receive messages" });
    if (deliv?.is_smtp_valid === false) return store({ ok: false, reason: "This email address does not exist" });
    if (deliv?.status === "undeliverable") return store({ ok: false, reason: "This email address does not exist" });
    if (quality?.is_username_suspicious === true) return store({ ok: false, reason: "This email address looks invalid" });
    if (risk?.address_risk_status === "high") return store({ ok: false, reason: "This email address is flagged as high risk" });
    if (typeof quality?.score === "number" && quality.score < 0.5) return store({ ok: false, reason: "This email address failed quality checks" });
    if (deliv?.status !== "deliverable") return store({ ok: false, reason: "This email address could not be verified" });

    return store({ ok: true });
  } catch (e) {
    console.error("[emailValidator] fetch failed:", (e as Error).message);
    return fallback("network error");
  }
}
