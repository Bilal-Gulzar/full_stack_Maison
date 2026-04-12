import { wrap, json } from "../_lib/http";
import { readSession } from "../_lib/jwt";
import { sanityServer } from "../_lib/sanityServer";

export default wrap(async (req, res) => {
  const session = readSession(req);
  if (!session) return json(res, 200, { user: null });
  const user = await sanityServer.fetch(
    `*[_type=="user" && _id==$id][0]{_id,email,name,avatar}`,
    { id: session.sub }
  );
  json(res, 200, { user });
});
