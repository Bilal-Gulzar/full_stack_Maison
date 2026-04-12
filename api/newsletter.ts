import { wrap, json, readJsonBody } from "./_lib/http";
import { sanityServer } from "./_lib/sanityServer";
import { verifyRecaptcha } from "./_lib/recaptcha";
import { validateEmail } from "./_lib/emailValidator";
import crypto from "crypto";

const subId = (email: string) =>
  `sub.${crypto.createHash("sha1").update(email).digest("hex").slice(0, 24)}`;

export default wrap(async (req, res) => {
  // GET = unsubscribe, POST = subscribe
  if (req.method === "GET") {
    const url = new URL(req.url || "/", "http://localhost");
    const email = String(url.searchParams.get("email") || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { json(res, 400, { error: "Invalid email" }); return; }

    await sanityServer
      .patch(subId(email))
      .set({ unsubscribed: true, unsubscribedAt: new Date().toISOString() })
      .commit()
      .catch(() => {});

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.end(`<!doctype html><html><body style="font-family:Georgia,serif;text-align:center;padding:80px 20px;background:#f5f3ef;">
      <h1 style="font-weight:300;letter-spacing:0.15em;font-size:32px;">MAISON</h1>
      <p>You have been unsubscribed.</p>
      <p style="color:#888;font-size:12px;">${email}</p>
    </body></html>`);
    return;
  }

  if (req.method !== "POST") { json(res, 405, { error: "Method not allowed" }); return; }

  const body = await readJsonBody(req);
  const email = String(body.email || "").trim().toLowerCase();
  const source = String(body.source || "footer");
  const recaptchaToken = String(body.recaptchaToken || "");

  const emailCheck = await validateEmail(email);
  if (!emailCheck.ok) { json(res, 400, { error: emailCheck.reason || "Invalid email" }); return; }

  const captcha = await verifyRecaptcha(recaptchaToken, "newsletter");
  if (!captcha.ok) { json(res, 400, { error: "reCAPTCHA failed" }); return; }

  const id = subId(email);
  const existing = await sanityServer.fetch<{ _id: string; unsubscribed?: boolean } | null>(
    `*[_id==$id][0]{_id, unsubscribed}`,
    { id }
  );

  if (existing) {
    if (existing.unsubscribed) {
      await sanityServer
        .patch(id)
        .set({ unsubscribed: false, subscribedAt: new Date().toISOString() })
        .unset(["unsubscribedAt"])
        .commit();
    }
    json(res, 200, { ok: true, alreadySubscribed: !existing.unsubscribed }); return;
  }

  await sanityServer.createOrReplace({
    _id: id,
    _type: "newsletterSubscriber",
    email,
    source,
    subscribedAt: new Date().toISOString(),
    unsubscribed: false,
  });

  json(res, 200, { ok: true });
});
