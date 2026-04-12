import crypto from "crypto";
import { wrap, json, readJsonBody } from "../_lib/http";
import { sanityServer } from "../_lib/sanityServer";
import { signSession, setSessionCookie } from "../_lib/jwt";

const hash = (code: string) =>
  crypto.createHash("sha256").update(code + (process.env.JWT_SECRET || "")).digest("hex");

export default wrap(async (req, res) => {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  const body = await readJsonBody(req);
  const email = String(body.email || "").trim().toLowerCase();
  const code = String(body.code || "").trim();
  if (!email || !/^\d{6}$/.test(code)) return json(res, 400, { error: "Invalid input" });

  const token = await sanityServer.fetch<{
    _id: string;
    codeHash: string;
    expiresAt: string;
    attempts: number;
  } | null>(
    `*[_type=="otpToken" && email==$email][0]{_id,codeHash,expiresAt,attempts}`,
    { email }
  );
  if (!token) return json(res, 400, { error: "Code expired or not found" });
  if (new Date(token.expiresAt).getTime() < Date.now()) {
    await sanityServer.delete(token._id);
    return json(res, 400, { error: "Code expired" });
  }
  if (token.attempts >= 5) {
    await sanityServer.delete(token._id);
    return json(res, 429, { error: "Too many attempts" });
  }
  if (token.codeHash !== hash(code)) {
    await sanityServer.patch(token._id).inc({ attempts: 1 }).commit();
    return json(res, 400, { error: "Wrong code" });
  }

  // Consume token + clear rate limit (so successful login resets the counter)
  const rateLimitId = `rate.${crypto.createHash("sha1").update(email).digest("hex").slice(0, 24)}`;
  await Promise.all([
    sanityServer.delete(token._id),
    sanityServer.delete(rateLimitId).catch(() => {}),
  ]);

  // Upsert user
  const existing = await sanityServer.fetch<{ _id: string; name?: string } | null>(
    `*[_type=="user" && email==$email][0]{_id,name}`,
    { email }
  );
  let userId: string;
  let name: string | undefined;
  if (existing) {
    userId = existing._id;
    name = existing.name;
  } else {
    const created = await sanityServer.create({
      _type: "user",
      email,
      name: email.split("@")[0],
      createdAt: new Date().toISOString(),
    });
    userId = created._id;
    name = email.split("@")[0];
  }

  const jwt = signSession({ sub: userId, email, name });
  setSessionCookie(res, jwt);
  json(res, 200, { user: { _id: userId, email, name } });
});
