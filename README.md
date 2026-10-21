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

GIFTWALA is recipient-first: shoppers describe the person, not the product.
The pipeline lives in `src/lib/finder/engine.ts`:

1. **Parse with rules** (`parse.ts`, `destination.ts`). Budget, date,
   destination (a Mumbai area, a PIN code or another city), interests and
   subject words are read by code, never by AI.
2. **Classify intent** (`intent.ts`). Nonsense (`bsibcisbc`), off-topic
   questions and vague requests ("a gift for my sister") stop here with no
   products. Vague requests get one follow-up question. When rules can't tell
   an unfamiliar word from gibberish, the AI is asked; if that fails, the safe
   answer (no products) stands.
3. **Hard filters + relevance** (`match.ts`). A product is only eligible if it
   matches what the brief is *about* (a subject word or interest) and passes
   the budget, date and destination checks. Occasion, recipient and modifiers
   like "handmade" can rank but never qualify a product. Nothing ever falls
   back to "all gifts".
4. **Gift ideas** (`src/data/gift-ideas.ts`). For interests the catalogue
   doesn't stock (cricket, travel, cars, tech…) the finder shows labelled
   ideas with things to check, and no price, seller, stock or link.
5. **AI ranking** (`ai.ts`, `gemini.ts`, `claude.ts`, `ranker.ts`). Optional.
   The model reorders and explains eligible products, may return fewer or
   none, and every id it returns is re-checked. If it times out or returns
   empty or malformed output, the page shows an error with "Try again"; keyword
   matches appear only if the shopper asks for them.
6. **Delivery status**. A listing is "estimated to arrive" only when both a
   destination and a date are given and the sample maker serves that area.
   Otherwise it says delivery isn't verified. Time slots are never confirmed.

### Listings vs ideas

| Type | What it is | Price / delivery | Next step |
| --- | --- | --- | --- |
| GIFTWALA listing | A record in the demo catalogue (`src/data/products.ts`) | Sample price; delivery estimated only with area/PIN + date | Request this gift |
| Gift idea | A concept (`src/data/gift-ideas.ts`) | None shown | "Before you buy, check" tips |
| Online-shop product | A real product on another shop's site (`src/data/external-products.ts`), checked by hand | Price as checked on the stated date; stock and delivery handled by the shop | "View on <shop>" link |

### Things you can buy vs gift ideas

The Gift Finder has two views, chosen in the describe box ("Show me") and
switchable on the results page:

- **Things you can buy:** GIFTWALA listings, online-shop products and a
  separate "Popular gifts" row (well-loved catalogue gifts within the same
  budget/date/area, labelled as not matched to the description).
- **Gift ideas:** idea cards only.

### Online-shop products

Collected by hand on 21 Oct 2026 from The Drunken Mug (upcycled glassware) and
Decathlon India (cricket, badminton, trekking, yoga). There is no feed,
affiliate link or partnership: prices and stock can change, so cards show the
"checked on" date and link to the shop. Product photos are the shops' own;
confirm permission with each shop before launch. Liquor-branded barware is
only suggested when the brief mentions drinks and never for a child.

### Gift box

`/gift-box` lets shoppers combine 2–6 GIFTWALA catalogue gifts into one box
(`src/lib/gift-box.ts`). A box can only go where every maker delivers, and its
earliest arrival is the slowest item plus one demo packing day. Online-shop
products can't be boxed because they ship from different shops.

## Tests

```bash
npm test
```

Runs Vitest on `src/lib/finder/finder.test.ts`: the 11 required search cases
(nonsense, off-topic, vague, short queries, budget, absent category, AI
timeout/malformed/empty, delivery checks, valid matches, catalogue browsing),
the cross-category examples, every homepage interest tile, and parser checks.

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
- Delivery estimates come from sample lead times, not a courier. A valid PIN
  format doesn't prove a courier serves the address; PINs aren't mapped to zones.
- Mumbai, Thane and Navi Mumbai only.
- No external retailer, affiliate, price or stock integrations exist, so gift
  ideas have no prices or links.
