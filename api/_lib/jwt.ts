import jwt from "jsonwebtoken";
import type { IncomingMessage, ServerResponse } from "http";

const SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = "maison_session";
const MAX_AGE = 60 * 60 * 24 * 5; // 5 days

export interface SessionPayload {
  sub: string; // sanity user _id
  email: string;
  name?: string;
}

export const signSession = (payload: SessionPayload) =>
  jwt.sign(payload, SECRET, { expiresIn: `${MAX_AGE}s` });

export const verifySession = (token: string): SessionPayload | null => {
  try {
    return jwt.verify(token, SECRET) as SessionPayload;
  } catch {
    return null;
  }
};

export const setSessionCookie = (res: ServerResponse, token: string) => {
  const isProd = process.env.NODE_ENV === "production";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}${isProd ? "; Secure" : ""}`
  );
};

export const clearSessionCookie = (res: ServerResponse) => {
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
};

export const readSession = (req: IncomingMessage): SessionPayload | null => {
  const cookie = req.headers.cookie || "";
  const match = cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  const token = match.split("=").slice(1).join("=");
  return verifySession(token);
};

export const requireSession = (req: IncomingMessage): SessionPayload => {
  const s = readSession(req);
  if (!s) {
    const err: Error & { statusCode?: number } = new Error("Unauthorized");
    err.statusCode = 401;
    throw err;
  }
  return s;
};
