import type { Plugin, ViteDevServer } from "vite";
import { loadEnv } from "vite";
import path from "path";
import fs from "fs";
import type { IncomingMessage, ServerResponse } from "http";

/**
 * Dev-only Vite plugin that mounts /api/*.ts files as serverless-style handlers.
 * In production these same files are picked up natively by Vercel.
 *
 * Mapping:
 *   /api/auth/otp-send  ->  api/auth/otp-send.ts (default export)
 *   /api/orders/create  ->  api/orders/create.ts
 */
export function devApiPlugin(): Plugin {
  return {
    name: "maison-dev-api",
    apply: "serve",
    configureServer(server: ViteDevServer) {
      const apiRoot = path.resolve(server.config.root, "api");

      // Load .env / .env.local into process.env so /api/* functions can read secrets
      const env = loadEnv(server.config.mode, server.config.root, "");
      for (const [k, v] of Object.entries(env)) {
        if (process.env[k] === undefined) process.env[k] = v;
      }

      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith("/api/")) return next();
        const urlPath = req.url.split("?")[0].replace(/^\/api\//, "");
        // Reject hidden helpers
        if (urlPath.startsWith("_")) return next();

        const candidates = [
          path.join(apiRoot, urlPath + ".ts"),
          path.join(apiRoot, urlPath, "index.ts"),
        ];
        const file = candidates.find((p) => fs.existsSync(p));
        if (!file) return next();

        try {
          const mod = await server.ssrLoadModule(file);
          const handler = mod.default;
          if (typeof handler !== "function") {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: `No default export in ${urlPath}` }));
          }
          await handler(req as IncomingMessage, res as ServerResponse);
        } catch (e) {
          const err = e as Error;
          // eslint-disable-next-line no-console
          console.error("[dev-api]", urlPath, err);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}
