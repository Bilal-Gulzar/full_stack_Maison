import { wrap, json, readJsonBody } from "../_lib/http";
import { sanityServer } from "../_lib/sanityServer";
import { signSession, setSessionCookie } from "../_lib/jwt";

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

export default wrap(async (req, res) => {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  const body = await readJsonBody(req);
  // Frontend uses google.accounts.oauth2.initTokenClient → access_token (not an ID token).
  // Accept either field for backwards compat.
  const accessToken = String(body.credential || body.accessToken || "");
  if (!accessToken) return json(res, 400, { error: "Missing Google access token" });

  // Verify token + fetch user info from Google
  let payload: GoogleUserInfo;
  try {
    const r = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!r.ok) throw new Error(`userinfo ${r.status}`);
    payload = (await r.json()) as GoogleUserInfo;
  } catch {
    return json(res, 401, { error: "Invalid Google token" });
  }
  if (!payload?.email) return json(res, 401, { error: "No email in Google token" });

  const email = payload.email.toLowerCase();
  const name = payload.name || email.split("@")[0];
  // Only persist avatar if Google actually returned one (and it looks like a URL)
  const avatar =
    payload.picture && /^https?:\/\//.test(payload.picture) ? payload.picture : undefined;
  const googleId = payload.sub;

  const existing = await sanityServer.fetch<{ _id: string } | null>(
    `*[_type=="user" && (email==$email || googleId==$googleId)][0]{_id}`,
    { email, googleId }
  );

  let userId: string;
  if (existing) {
    userId = existing._id;
    const patch = sanityServer.patch(userId).set({ googleId, name });
    if (avatar) patch.set({ avatar });
    else patch.unset(["avatar"]);
    await patch.commit();
  } else {
    const created = await sanityServer.create({
      _type: "user",
      email,
      name,
      googleId,
      ...(avatar && { avatar }),
      createdAt: new Date().toISOString(),
    });
    userId = created._id;
  }

  const jwt = signSession({ sub: userId, email, name });
  setSessionCookie(res, jwt);
  json(res, 200, { user: { _id: userId, email, name, avatar } });
});
