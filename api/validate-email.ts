import { wrap, json, readJsonBody } from "./_lib/http";
import { validateEmail } from "./_lib/emailValidator";

export default wrap(async (req, res) => {
  if (req.method !== "POST") { json(res, 405, { error: "Method not allowed" }); return; }
  const body = await readJsonBody(req);
  const email = String(body.email || "").trim().toLowerCase();
  if (!email) { json(res, 400, { ok: false, error: "Email required" }); return; }

  const result = await validateEmail(email);
  json(res, 200, result);
});
