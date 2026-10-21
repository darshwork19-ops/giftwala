# GIFTWALA

A curated B2C gifting marketplace that helps people find thoughtful, personal
gifts from independent makers. Built as a solo hackathon project with Next.js
(App Router), React, TypeScript and Tailwind CSS v4.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

| Script              | What it does                         |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Development server with hot reload   |
| `npm run lint`      | ESLint (Next.js + TypeScript rules)  |
| `npm run typecheck` | TypeScript check without emitting    |
| `npm run build`     | Production build                     |
| `npm run start`     | Serve the production build           |

## Project structure

```
src/
  app/                 Routes (App Router). layout.tsx holds header/footer.
  components/
    layout/            Announcement bar, header, footer, wordmark
    home/              Homepage sections
    product/           Product card
    ui/                Buttons, icons, image with fallback, section heading
  data/                Sample catalogue: products, makers, taxonomy
  lib/                 Types, catalogue helpers, routes, formatting, images
```

- **Design tokens** live in `src/app/globals.css` (`@theme`). Use utilities
  such as `bg-ivory`, `text-burgundy`, `border-linen` rather than raw hex.
- **Fonts:** Fraunces (serif headlines) and Geist (sans body), via `next/font`.
- **Routes** are centralised in `src/lib/routes.ts`.
- **Catalogue access** goes through `src/lib/catalogue.ts`, so the local data
  can later be replaced with a database without changing the UI.

## Sample data — please read

All makers, products, prices, stock levels and processing times in
`src/data/` are **fictional demonstration records**. They are not real
businesses, partnerships or verified sellers.

Photography is free-licence stock imagery from [Unsplash](https://unsplash.com),
loaded from Unsplash's CDN. Photos were chosen to match each product, but they
do not show the exact item described.

## How the Gift Finder works

The MVP journey is: describe the person → see 3 matched gifts → send an order request.

1. **Describe.** One free-text box (`src/components/finder/describe-box.tsx`).
2. **Rules first** (`src/lib/finder/parse.ts`, `match.ts`). Budget, date and Mumbai
   area are read by code, never by AI. Gifts that are over budget, can't arrive
   in time (maker lead time in working days + delivery days) or aren't delivered
   to the area are removed before anything else happens.
3. **AI ranks** (`POST /api/match`). Gemini (`src/lib/finder/gemini.ts`) or
   Claude (`claude.ts`) only sees gifts that passed the filters, must pick from
   their ids, and writes the "why it fits" line. Both share one prompt and one
   output schema (`ranker.ts`), and every pick is re-checked in code. With no
   AI key, or if the call fails, the finder falls back to keyword ranking and
   the page says so.
4. **Order request** (`/request/[slug]` → `/requests?ref=…`). The buyer picks
   only the personalisation the product supports, and the page builds one
   structured message for the maker. WhatsApp and email open with the message
   pre-filled. Status (ready → sent → confirmed) is updated by the buyer.

## Configuration

Copy `.env.example` to `.env.local` (or add the values in Vercel → Project →
Settings → Environment Variables). Both settings are optional.

| Variable            | Effect                                                        |
| ------------------- | ------------------------------------------------------------- |
| `GEMINI_API_KEY`    | Turns on Gemini matching (default model `gemini-3.8-flash`). Get a key at [Google AI Studio](https://aistudio.google.com/apikey). |
| `GEMINI_MODEL`      | Optional Gemini model override. |
| `ANTHROPIC_API_KEY` | Turns on Claude matching instead (`claude-opus-5-5`). Used only if no Gemini key is set. |
| `ORDER_WEBHOOK_URL` | Forwards each order request as JSON, e.g. to an n8n workflow. |

## Not connected / demo limits

- No payments: a request asks the maker to confirm; payment is agreed directly.
- Order requests are stored in the buyer's browser (`localStorage`) only.
- Sample makers have no real phone numbers or emails, so WhatsApp and email
  open without a recipient.
- Delivery estimates come from sample lead times, not a courier.
- Mumbai only.
