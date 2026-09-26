# TruckFlow Marketing Site

Standalone marketing/advertisement site for **TruckFlow** (transport management
system for carriers and brokers). Plain HTML/CSS/vanilla JS — no build step,
no framework, no dependencies. Not connected to the app.stsgp.com or
stsgp.com codebases in any way.

## Structure

```
index.html          Homepage — hero, features grid, social proof, pricing
features.html        Expanded detail per feature area
request-demo.html    Demo request form + confirmation
css/styles.css        All styles (design tokens at the top)
js/main.js            Mobile nav toggle + demo form submit handler
assets/favicon.svg    Brand mark used as the favicon
```

## Running locally

No build step — just serve the folder:

```
npx serve .
```

or open `index.html` directly in a browser (all links are root-relative,
so a local static server is more accurate than double-clicking the file).

## Demo form → email

The form on `request-demo.html` posts to [FormSubmit](https://formsubmit.co),
a free form-to-email relay — no account, server, or database. Each lead
arrives as an email to `LEAD_EMAIL` in `js/main.js`.

1. **One-time activation:** the first submission sends an "Activate Form"
   email to that address. Click it; from then on every lead is delivered.
   (The first submission itself is not delivered — resend a test after activating.)
2. Optional: FormSubmit then provides a random alias string; swap it in for
   the plain address in `LEAD_EMAIL` so the address isn't visible in page source.
3. Spam: a hidden `_honey` field silently drops bot submissions.

## Editable placeholders

- **Pricing** (`index.html`, `#pricing` section): tier names, prices, and
  feature bullets are placeholders — edit directly in the HTML.
- **Social proof** (`index.html`, `#proof` section): customer logos and the
  testimonial quote are placeholders, clearly marked with an HTML comment.
- **Contact email**: `hello@trucksflo.com` appears in both footers — update
  if the real inbox is different.

## Deployment

Hosted on **GitHub Pages** from the `main` branch root. The `CNAME` file
pins the custom domain `trucksflo.com`; `.nojekyll` serves files as-is.
Pushing to `main` redeploys automatically (~1 min).

DNS for `trucksflo.com` (at Hostinger):

| Type  | Name | Value                         |
|-------|------|-------------------------------|
| A     | @    | 185.199.108.153               |
| A     | @    | 185.199.109.153               |
| A     | @    | 185.199.110.153               |
| A     | @    | 185.199.111.153               |
| CNAME | www  | saghirahmed312.github.io      |

Remove any existing A/AAAA/ALIAS record on `@` and any existing `www` record first.
