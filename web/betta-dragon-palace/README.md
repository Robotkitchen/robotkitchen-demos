# Betta Home — RK website demo

Fictional aquarium-grade shop: live bettas + full supply catalog (18 accessory categories from research notes, plus food and tanks). English site; brand name **Betta Home**.

## Local

```bash
cd /workspace/rk-landing
export PATH="/tmp/node-v22.21.0-linux-x64/bin:$PATH"
npx wrangler@4.157.0 dev --local --port 8787
# open http://127.0.0.1:8787/demo/web/betta-dragon-palace/
# seed cart: ?seed=1
```

Without `STRIPE_SECRET_KEY`, Pay opens `mock-checkout.html`.

## Features

- Clickable catalog (categories + product modals), cart, NJ sales tax **6.625%** on goods
- Live-animal rules: overnight or local pickup; ground locked when live fish in cart
- Shipping policy page (`#/shipping`) — clearly fictional demo text
- Stripe TEST via Worker `POST /api/create-checkout-session` (same as Night Coil)
- Original SVG / Pillow mark art only (no GenerateImage; no copied photos)
- `noindex`, og/apple-touch/favicon from demo logo
- Footer: “Betta Home is a fictional brand created as a Robot Kitchen portfolio demo.”

## Path

`/workspace/rk-landing/public/demo/web/betta-dragon-palace/` → `/demo/web/betta-dragon-palace/`

**Do not deploy** without IJen OK.
