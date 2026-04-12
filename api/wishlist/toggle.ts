import { wrap, json, readJsonBody } from "../_lib/http";
import { sanityServer } from "../_lib/sanityServer";
import { requireSession } from "../_lib/jwt";

export default wrap(async (req, res) => {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  const session = requireSession(req);
  const body = await readJsonBody(req);
  const productId = String(body.productId || "");
  if (!productId) return json(res, 400, { error: "Missing productId" });

  const existing = await sanityServer.fetch<{ _id: string } | null>(
    `*[_type=="wishlistItem" && user._ref==$uid && product._ref==$pid][0]{_id}`,
    { uid: session.sub, pid: productId }
  );

  if (existing) {
    await sanityServer.delete(existing._id);
    return json(res, 200, { inWishlist: false });
  }
  await sanityServer.create({
    _type: "wishlistItem",
    user: { _type: "reference", _ref: session.sub },
    product: { _type: "reference", _ref: productId },
    addedAt: new Date().toISOString(),
  });
  json(res, 200, { inWishlist: true });
});
