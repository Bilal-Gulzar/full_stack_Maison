import dns from "node:dns/promises";

const email = process.argv[2] || "bilalgul415@gmail.com";
const domain = email.split("@")[1];

console.log("Testing:", email);
console.log("Domain:", domain);

// Format check
const FORMAT_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
console.log("Format valid:", FORMAT_RE.test(email));

// MX lookup
try {
  const records = await dns.resolveMx(domain);
  console.log("MX records:", records.length > 0 ? "YES" : "NO");
  records.forEach(r => console.log("  ", r.exchange, "priority:", r.priority));
} catch (e) {
  console.log("MX lookup failed:", e.message);
}
