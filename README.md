# Scanlon Funeral & Transfer Services — website

Static site (no build step). Design: "1 · Bold & Dark" from Claude Design.

Files
- index.html   page content
- styles.css   look (desktop + mobile)
- app.js       live estimate + booking form
- config.js    THE ONLY FILE TO EDIT: Web3Forms key, Stripe deposit link, deposit amount

Payment options at launch: "Bill me" (default) and "Pay a deposit". Card-at-booking for the full amount is planned as a later upgrade (exact-amount Stripe Checkout via a Cloudflare function).
- assets/      logo + favicons

Hosting: GitHub repo -> Cloudflare Pages (framework preset: None, build command: blank, output directory: /).
Every commit to main redeploys automatically.

Changing prices: edit the tables in index.html AND the numbers in estimate() in app.js so they match.
