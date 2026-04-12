import type { IncomingMessage, ServerResponse } from "http";

export type ApiHandler = (req: IncomingMessage & { body?: unknown }, res: ServerResponse) => Promise<void> | void;

export const json = (res: ServerResponse, status: number, body: unknown) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
};

export const readJsonBody = (req: IncomingMessage): Promise<Record<string, unknown>> =>
  new Promise((resolve, reject) => {
    if ((req as IncomingMessage & { body?: unknown }).body !== undefined) {
      const b = (req as IncomingMessage & { body?: unknown }).body;
      return resolve((typeof b === "string" ? JSON.parse(b) : (b as Record<string, unknown>)) || {});
    }
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });

export const wrap =
  (handler: ApiHandler): ApiHandler =>
  async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      const e = err as Error & { statusCode?: number };
      const status = e.statusCode || 500;
      // eslint-disable-next-line no-console
      console.error("[api]", req.url, e.message);
      json(res, status, { error: e.message || "Internal error" });
    }
  };
