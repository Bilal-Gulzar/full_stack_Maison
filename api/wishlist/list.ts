import { wrap, json } from "../_lib/http";
import { sanityServer } from "../_lib/sanityServer";
import { requireSession } from "../_lib/jwt";

export default wrap(async (req, res) => {
  const session = requireSession(req);
  const items = await sanityServer.fetch(
    `*[_type=="wishlistItem" && user._ref==$uid]{_id, addedAt, "product": product->{_id,title,price,"image": images[0].asset->url,slug}}`,
    { uid: session.sub }
  );
  json(res, 200, { items });
});
