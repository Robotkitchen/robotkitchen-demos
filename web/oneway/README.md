# One Way — airport ride-hailing demo

Invented brand (not Uber). Solo airport-driver loop pricing for Central NJ.

## Local preview (do not deploy)

```bash
export PATH="/tmp/node-v22.21.0-linux-x64/bin:$PATH"
cd /workspace/rk-landing
npx wrangler dev --local --port 8787
# Rider:  http://127.0.0.1:8787/demo/web/oneway/
# Driver: http://127.0.0.1:8787/demo/web/oneway/driver/
```

## Fare model

Every ride is priced on the driver’s **full loop**: home → pickup → drop-off → home.
Home base coordinates live in `src/oneway.js` (server-side only; no street address shown to riders).

`fare ≈ (loopMiles × $0.70) + time + tolls + margin`, then × 1.35 for 5–6 passengers (1–4 = base). One car, max 6.
Above `maxLoopMiles` → “Outside service area / 不接”.

## Stripe

Uses existing Worker `/api/create-checkout-session` with `STRIPE_SECRET_KEY` from `.dev.vars` (**sk_test_** only).
Demo receipt stays in-app; session creation is TEST mode. No live keys.

## Paths

- `/demo/web/oneway/` — rider
- `/demo/web/oneway/driver/` — driver + collapsible loop math
- `/api/oneway/config` — public config (no home coords)
- `/api/oneway/quote` — fare quote
