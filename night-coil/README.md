# Night Coil BBQ — Iron Chef demo #1

Invented Korean BBQ food-truck brand. Service-level benchmark: **Kogi BBQ / The Halal Guys**. Function: **Square / Roaming Hunger**-style mobile order.

## Local

```bash
cd /workspace/rk-landing
npx wrangler dev --local --port 8787
# open http://127.0.0.1:8787/demo/night-coil/
```

Without `STRIPE_SECRET_KEY`, Pay opens `mock-checkout.html`.

## Stripe (IJen next step)

1. Create a Stripe account at https://dashboard.stripe.com/register  
2. Turn on **Test mode**.  
3. Developers → API keys → copy **Secret key** (`sk_test_…`).  
4. Set Worker secret (never commit):

```bash
cd /workspace/rk-landing
npx wrangler secret put STRIPE_SECRET_KEY
# paste sk_test_… when prompted
```

Publishable key is **not** required for Stripe Checkout (server creates the session). Optional later for Stripe.js / Elements: `pk_test_…`.

## Deploy later (do not run until approved)

```bash
cd /workspace/rk-landing && npx wrangler deploy
```

Live paths after deploy: `https://robotkitchen.us/demo/night-coil/`


## Link preview icons & Open Graph (reusable for future demos)

iMessage / RCS / Slack / Discord pick a **PNG apple-touch-icon** (not SVG) for the small chip, and **og:image** for the large card. Match this pattern on every new demo:

1. From the demo logo SVG, generate opaque dark-background PNGs into `img/`:
   - `favicon-32.png` (32×32), `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (180×180)
   - Brand dark: `#0F0F10` (or that demo’s `--bg`)
2. Build a **1200×630** `img/og-<slug>.jpg` from the hero photo + logo (absolute `https://robotkitchen.us/...` URL in meta).
3. In **every HTML page** under the demo (index + checkout + extras), add:
   - `<link rel="icon" type="image/png" sizes="32x32" href="img/favicon-32.png" />` (+ 192/512)
   - `<link rel="apple-touch-icon" sizes="180x180" href="img/apple-touch-icon.png" />`
   - Full Open Graph: `og:title`, `og:description`, `og:image`, `og:image:width`, `og:image:height`, `og:url`, `og:type`=`website`
   - Twitter: `twitter:card`=`summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`
4. Keep SVG as the in-page logo asset; do **not** rely on `type="image/svg+xml"` favicons for iOS previews.
5. After deploy, `curl -sI` the icon and og image (expect 200) and `curl -s` the HTML to confirm meta tags.

Night Coil assets: `img/apple-touch-icon.png`, `img/favicon-32.png`, `img/icon-192.png`, `img/icon-512.png`, `img/og-night-coil.jpg`.
