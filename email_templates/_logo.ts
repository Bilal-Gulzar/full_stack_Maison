/**
 * Reads the MAISON logo from /public and returns a base64 data URI
 * suitable for inline use in <img src="..."> inside email HTML.
 *
 * Why a data URI: emails are sent server-side and SITE_URL is often
 * not set / not publicly reachable. Inlining bypasses both problems.
 *
 * Result is cached after first read.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

let cachedLight: string | null = null;
let cachedDark: string | null = null;

function readAsDataUri(filename: string): string {
  try {
    // process.cwd() resolves to the project root in serverless functions
    const fullPath = join(process.cwd(), "public", filename);
    const buf = readFileSync(fullPath);
    const b64 = buf.toString("base64");
    return `data:image/svg+xml;base64,${b64}`;
  } catch {
    // Fallback: empty 1x1 transparent pixel — keeps the <img> tag valid
    return "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  }
}

export function getLogoLightDataUri(): string {
  if (!cachedLight) cachedLight = readAsDataUri("maison-logo-light.svg");
  return cachedLight;
}

export function getLogoDarkDataUri(): string {
  if (!cachedDark) cachedDark = readAsDataUri("maison-logo-dark.svg");
  return cachedDark;
}
