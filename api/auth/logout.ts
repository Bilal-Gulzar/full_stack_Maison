import { wrap, json } from "../_lib/http";
import { clearSessionCookie } from "../_lib/jwt";

export default wrap(async (_req, res) => {
  clearSessionCookie(res);
  json(res, 200, { ok: true });
});
