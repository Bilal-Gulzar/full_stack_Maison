import { wrap, json, readJsonBody } from "./_lib/http";
import { sanityServer } from "./_lib/sanityServer";
import { sendContactNotificationEmail } from "./_lib/email";
import { verifyRecaptcha } from "./_lib/recaptcha";
import { validateEmail } from "./_lib/emailValidator";

export default wrap(async (req, res) => {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  const body = await readJsonBody(req);
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const subject = String(body.subject || "").trim();
  const message = String(body.message || "").trim();
  const recaptchaToken = String(body.recaptchaToken || "");

  if (!name || !email || !message) return json(res, 400, { error: "Missing fields" });
  const emailCheck = await validateEmail(email);
  if (!emailCheck.ok) return json(res, 400, { error: emailCheck.reason || "Invalid email" });
  if (message.length > 5000) return json(res, 400, { error: "Message too long" });

  const captcha = await verifyRecaptcha(recaptchaToken, "contact");
  if (!captcha.ok) return json(res, 400, { error: "reCAPTCHA failed" });

  await sanityServer.create({
    _type: "contactMessage",
    name,
    email,
    subject,
    message,
    createdAt: new Date().toISOString(),
  });

  try {
    if (process.env.ADMIN_EMAIL) {
      await sendContactNotificationEmail(process.env.ADMIN_EMAIL, { name, email, subject, message });
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[contact] notify failed", e);
  }

  json(res, 200, { ok: true });
});
