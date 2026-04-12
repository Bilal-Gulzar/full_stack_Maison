/**
 * Phone validation helpers using libphonenumber-js (Google's libphonenumber port).
 * Default country: Pakistan (PK / +92).
 */
import { parsePhoneNumberFromString, isValidPhoneNumber, type CountryCode } from "libphonenumber-js";

export const DEFAULT_COUNTRY: CountryCode = "PK";

export interface PhoneCheck {
  ok: boolean;
  e164?: string;          // +923171234567
  national?: string;       // 0317 1234567
  reason?: string;
}

export function validatePhone(raw: string, country: CountryCode = DEFAULT_COUNTRY): PhoneCheck {
  const trimmed = (raw || "").trim();
  if (!trimmed) return { ok: false, reason: "Phone is required" };

  if (!isValidPhoneNumber(trimmed, country)) {
    return { ok: false, reason: "Invalid phone number" };
  }

  const parsed = parsePhoneNumberFromString(trimmed, country);
  if (!parsed || !parsed.isValid()) {
    return { ok: false, reason: "Invalid phone number" };
  }

  return {
    ok: true,
    e164: parsed.number,                 // +923171234567
    national: parsed.formatNational(),    // 0317 1234567
  };
}
