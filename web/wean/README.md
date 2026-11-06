# WEAN Glass — Robot Kitchen retail demo

IJen's boutique glassware brand storefront (portfolio demo). Pattern mirrors **Night Coil**: cart + Stripe Checkout TEST via Worker `POST /api/create-checkout-session` and `checkoutOrigin()`.

Order numbers: **WG-xxxxxx**. Age gate: 21+, shown on every page load (not remembered).

Copy is tobacco / legal-use only. No cannabis leaf imagery. No health claims.

## Local

```bash
cd /workspace/rk-landing
export PATH="/tmp/node-v22.21.0-linux-x64/bin:$PATH"
npx wrangler dev --local --port 8788
# open http://127.0.0.1:8788/demo/web/wean/
```

Requires `.dev.vars` `STRIPE_SECRET_KEY=sk_test_…` (never commit). Without it, Pay opens `mock-checkout.html`.

Optional: `CHECKOUT_PUBLIC_ORIGIN=http://127.0.0.1:8788`

## Stripe notes

Stripe often restricts tobacco / smoking paraphernalia. A **live** launch would need a high-risk-friendly processor; this demo uses **TEST mode only**.

## Deploy later (do not run until approved)

```bash
cd /workspace/rk-landing && npx wrangler deploy
```

Live path after deploy: `https://robotkitchen.us/demo/web/wean/`

## Link preview icons & Open Graph

Same pattern as Night Coil README: PNG favicons + `apple-touch-icon` + 1200×630 `img/og-wean.jpg` on every HTML page.

WEAN assets: `img/apple-touch-icon.png`, `img/favicon-32.png`, `img/icon-192.png`, `img/icon-512.png`, `img/og-wean.jpg`, hero from IJen's storefront photo.


## Catalog expand (2026-11-03)
Expanded category nav + search; ~50+ SKUs; WEAN logo v2 (W-ea-N monogram). Demo only — do not treat as live inventory.
