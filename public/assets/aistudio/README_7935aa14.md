# MITSU Crntzz — handmade storefront & WhatsApp order enquiries

A Next.js (App Router) + PostgreSQL/Drizzle site for a creative handmade brand:
crochet, rangoli art, personalised creations and meaningful gifting.

## Theme (from the approved reference)

- Forest-green header with the circular lotus badge, `MITSU` serif + `Crntzz` pink script,
  nav **Home · About · Shop · Creations · Blog · Contact**, search, bag and a pink
  "Follow Us ♡" pill.
- Cream / blush canvas, pink lotus + green leaf hero, large lotus medallion (pure SVG).
- Six sage **arch tabs** under the hero — Art & Crafts · Giftables · Lifestyle · Our Store ·
  DIY Ideas · More… — each opening its **own page** (option B: no long scroll).
- "About Us" teaser with washi-tape polaroid, script line and a forest blob holding
  Premium Quality · Eco-Friendly · Made with Love.
- Fonts: Cormorant Garamond (display), Great Vibes (script), Lora (body).
- Design tokens live in `src/app/globals.css` (`@theme`), components in `@layer components`.

## Site map (every tab is a separate, short page)

| Route | Purpose |
| --- | --- |
| `/` | Hero, arch tabs, About teaser, one featured row |
| `/about` | Story, values, how we work |
| `/shop`, `/shop/[slug]` | Store with category filters, product detail + add to bag |
| `/collections/art-and-crafts` · `/giftables` · `/lifestyle` | Category tab pages |
| `/creations` | Gallery of recent commissioned pieces |
| `/custom-orders` | Custom enquiry form → WhatsApp / email |
| `/diy-ideas`, `/diy-ideas/[slug]` | DIY index + one page per idea |
| `/blog`, `/blog/[slug]` | Blog index + one page per post |
| `/more`, `/faq` | Hub of everything else, FAQs, follow-along section |
| `/offers` | Live special offers with codes, terms and WhatsApp claiming |
| `/contact` | WhatsApp + email cards, honest contact form |
| `/cart` | Bag → details → WhatsApp order message |
| `/search?q=` | Searches products, DIY, blog and creations |

Old `/products` URLs redirect permanently to `/shop`.

## Central business configuration

Every public phone number, WhatsApp link and email address is defined **once** in
[`src/lib/site.ts`](src/lib/site.ts):

| Detail | Value |
| --- | --- |
| WhatsApp number | `+91 95319 83688` (`919531983688`) |
| WhatsApp link | `https://wa.me/919531983688` |
| Business email | `meetalij24@gmail.com` |
| Email link | `mailto:meetalij24@gmail.com` |
| Instagram | `siteConfig.socials.instagram` — empty until provided (Follow Us then points to `/more#follow`) |

Helpers: `buildWhatsAppLink(message)` (URL-encodes the whole message) and
`buildEmailLink(subject, body)`.

## What the studio makes & the three levels

Alpona · Rangolis · Fabric paintings · Designing arts · Festive gift hampers · Greeting cards ·
Photo framing & polaroids · Customised diaries — plus custom orders, all at minimal prices.

Every product in `src/lib/catalog.ts` carries three tiers:

| Level | Meaning | Price |
| --- | --- | --- |
| **Basic** | Ready design at the most minimal price | fixed (from ₹99) |
| **Premium** | Bigger, richer detailing, gift-ready | fixed |
| **Customise** | Made to the customer's brief | `null` → quoted on WhatsApp |

Cart items are keyed by `slug + tier`. The server re-prices each line from the catalogue;
Customise lines are listed as "price to be quoted" and excluded from the subtotal, which is
labelled "priced items" everywhere (bag, summary, WhatsApp message).

## Order flow (cart → WhatsApp)

1. Add pieces to the bag (`localStorage`, quantities 1–20).
2. `/cart` collects name, WhatsApp number, delivery address and order notes.
3. The browser POSTs `{ customer, items: [{ slug, tier, quantity }] }` to `/api/orders`.
4. The **server** re-validates everything, re-prices from `src/lib/catalog.ts` (client
   prices are never trusted), computes the subtotal, stores the enquiry in
   `order_enquiries` and returns an encoded `wa.me` deep link with the full message.
5. The UI shows the summary and opens WhatsApp — **the customer presses Send**. Nothing is
   ever described as placed or confirmed; the studio confirms personally in chat.

## Contact & custom enquiries

- Both forms are validated server-side and stored in `enquiries`.
- Email is sent **only** from the server via Resend when `RESEND_API_KEY` is set. Without it,
  the API returns `emailDelivery: { configured: false, delivered: false }` and the UI says the
  message was saved but **not emailed**, offering WhatsApp and `mailto:` alternatives.

```bash
RESEND_API_KEY=            # server-only secret, never exposed to the browser
CONTACT_TO_EMAIL=meetalij24@gmail.com
CONTACT_FROM_EMAIL=MITSU Crntzz <onboarding@resend.dev>
NEXT_PUBLIC_SITE_URL=https://your-domain.example
```

## Security & validation

- Shared sanitisers in `src/lib/validation.ts` (control characters stripped, length limits,
  Indian phone normalisation with/without `+91`, email checks).
- Every API route re-validates and returns per-field errors; per-IP rate limiting.
- WhatsApp/email payloads are fully URL-encoded; no secrets in any client bundle.

## Commands

```bash
npm run dev
npm run build
npx drizzle-kit push --config=drizzle.config.json
npm run lint && npm run typecheck
# end-to-end checks against a running production server:
npx next start -p 3100 & node scripts/e2e-check.mjs http://localhost:3100
```
