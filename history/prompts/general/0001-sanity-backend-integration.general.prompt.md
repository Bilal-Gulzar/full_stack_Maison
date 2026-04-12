---
id: 0001
title: Sanity backend + custom auth integration
stage: general
date: 2026-04-09
surface: agent
model: claude-opus-4-6
feature: none
branch: feat/sanity-backend-integration
user: bilal gul
command: /sp.implement (free-form)
labels: ["sanity", "auth", "jwt", "google-oauth", "resend", "vite", "react"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - sanity/schemas/{user,article,product,wishlist,order,contactMessage,otpToken}.ts
  - sanity/schemas/index.ts
  - studio/config.ts
  - src/pages/Studio.tsx
  - src/lib/sanity.ts
  - src/services/{api,products,articles,orders,wishlist,contact}.ts
  - src/hooks/useProducts.ts
  - src/contexts/AuthContext.tsx (rewritten)
  - src/contexts/WishlistContext.tsx (synced to API)
  - src/auth/ProtectedRoute.tsx
  - api/_lib/{http,jwt,sanityServer,email}.ts
  - api/_dev-plugin.ts
  - api/auth/{otp-send,otp-verify,google,me,logout}.ts
  - api/orders/create.ts
  - api/contact.ts
  - api/wishlist/{toggle,list}.ts
  - src/pages/{Login,Contact,Checkout,Articles,Orders,OrderDetail,OrderConfirmation,ProductDetail,Shop}.tsx
  - src/components/{NewArrivals,SearchOverlay}.tsx
  - vite.config.ts, vercel.json, .env.example, .env.local
tests:
  - manual: vite build (passed)
---

# Prompt
User asked for a complete one-pass rebuild of the existing Lovable-generated React+Vite frontend, keeping the UI intact and adding:
- Sanity as the entire backend (CMS, DB, API) with embedded Studio at /studio
- Custom Email-OTP + Google OAuth auth with JWT sessions (no Clerk/Supabase)
- Free email via Resend
- Sanity schemas: User, Article, Product, Wishlist, Order, ContactMessage
- Auth guards on protected routes
- "No traditional backend server" — must use serverless functions

Provided env: Sanity projectId fa5izbm6, write token, JWT secret, Resend key, Google OAuth client.

# Response (summary)
Architectural decision: serverless functions in `/api` (Vercel-style) — the only way to securely handle JWT signing, OTP storage, Resend, and Google ID-token verification without leaking secrets to the browser.

Implemented:
1. **Sanity schemas** — 7 document types incl. internal `otpToken` for OTP hash storage.
2. **Embedded Studio** — `studio/config.ts` + lazy-loaded `/studio/*` route, same projectId.
3. **Browser Sanity client** (`src/lib/sanity.ts`) — read-only, no token shipped.
4. **Server Sanity client** (`api/_lib/sanityServer.ts`) — uses SANITY_WRITE_TOKEN.
5. **Auth API** — `/api/auth/otp-send|otp-verify|google|me|logout`. JWT in httpOnly cookie. User upserted in Sanity. OTP codes hashed with sha256(code+JWT_SECRET), 10-min expiry, max 5 attempts.
6. **Orders API** — validates JWT, re-validates prices/products from Sanity (anti-tamper), creates order doc, appends to user.orders, sends Resend confirmation.
7. **Contact API** — validates input, stores message, notifies ADMIN_EMAIL.
8. **Wishlist API** — toggle/list endpoints; WishlistContext hydrates from server when logged in.
9. **Vite dev plugin** (`api/_dev-plugin.ts`) — mounts `api/*.ts` files as middleware so `npm run dev` works without `vercel dev`. In prod Vercel picks them up natively via `vercel.json`.
10. **AuthContext rewrite** — calls /api/auth/*, hydrates session via /api/auth/me, exposes requestOtp/verifyOtp/loginWithGoogle while keeping legacy `login`/`signup` stubs so unmigrated components still compile.
11. **ProtectedRoute** wraps /checkout, /orders, /orders/:id, /order-confirmation/:id, /wishlist.
12. **Login page** wired to real OTP + Google Identity Services button (loaded dynamically).
13. **Page wiring** — Contact, Checkout, Orders, OrderDetail, OrderConfirmation, Articles, ProductDetail, Shop, NewArrivals, SearchOverlay all consume Sanity (via `useProducts()` hook with static fallback when CMS empty).
14. **Build passes** — `vite build` ✓ (Studio chunk ~4.8MB lazy).
15. **Sanity v3** pinned (Sanity 5 requires React 19; project is React 18).

# Outcome
Frontend untouched (UI/design preserved). Backend wired through /api functions and Sanity. Ready for deployment to Vercel: just set env vars in Vercel dashboard. Local dev: `npm run dev` (port 3000). Studio at /studio.

# Follow-ups / risks
- User must rotate the secrets that were pasted in chat (Sanity write token, JWT secret, Resend key, Google client secret).
- OAuth redirect: GIS one-tap button uses ID token flow — no redirect URI needed, but user must add `http://localhost:3000` and prod URL to authorized JS origins in Google Cloud Console.
- Resend free tier is restricted to verified domain or `onboarding@resend.dev` to verified test address only.
- Static src/data/products.ts kept as a fallback so UI isn't blank before content is seeded; can be deleted after content goes into Sanity.
