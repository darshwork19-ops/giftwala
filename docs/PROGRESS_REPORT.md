# GIFTWALA: Progress report

**Date:** 22 Oct 2026

- **Live prototype:** https://giftwala-xi.vercel.app
- **Code:** https://github.com/darshwork19-ops/giftwala

## What GIFTWALA is

GIFTWALA is a recipient-first gift discovery marketplace for Mumbai. You don't start with a product. You start with the person: who they are, what they love, the occasion, your budget and when it must arrive. GIFTWALA then suggests gifts that fit them. It is consumer-only, with no corporate gifting.

## What works today (live on Vercel)

| Area | What a shopper can do |
|---|---|
| **Guided Gift Finder** | Tap through 6 quick questions (who, occasion, up to 5 interests, style, budget, when and where) with no typing. They can still choose to write a description in their own words. |
| **AI matching** | Gemini (Google AI Studio) picks and explains gifts from the matching catalogue items. Rule-based filters for budget, date and delivery area run first, so the AI can never suggest something out of budget or late. Nonsense input ("bsibcisbc") gets a clear "we couldn't understand that" instead of random gifts. If the AI fails, the shopper sees a retry option or keyword matches. |
| **Results** | "Things you can buy" and "Gift ideas" tabs. GIFTWALA catalogue gifts come with delivery estimates. Products from an online shop (The Drunken Mug) and independent Mumbai makers are also included. Refinement buttons: other ideas, less expensive, more handmade, more unusual. |
| **Real Mumbai makers** | 13 independent Instagram gifting studios, checked with Apify for real engagement (median likes, comments, posted within 60 days). Each has a page (`/studios/<handle>`) listing 58 products taken from their posts, with a "Visit their Instagram" button. 7 more candidate handles were rejected because their engagement was too low. |
| **Online shop catalogue** | All 86 in-stock products from The Drunken Mug, taken from its public product feed, with photos, prices and "Buy on their site" links. Liquor-branded pieces are marked 18+ and are never suggested for children. |
| **Browse** | Discover page with search and filters, product pages, Shop by Occasion, Meet the Makers, and 40 gift ideas. |
| **Gift box** | Mix and match 2 to 6 gifts. GIFTWALA checks that every maker delivers to the same area and works out the earliest arrival date. |
| **Sign-in (demo)** | Name, email, mobile and date of birth, with the anniversary optional. Shown when someone adds their first gift. "Continue with Google" is marked as coming soon. |
| **Cart and checkout** | Cart with quantities, then the delivery address (Mumbai/Thane/Navi Mumbai only, a Mumbai PIN, and an arrive-by date no earlier than the slowest item), then a billing address (same as delivery, or any Indian address), then a review and confirm step. |
| **Payment (simulated)** | A test gateway offering UPI, card or netbanking, with success and failure outcomes. A successful payment shows the order confirmation and appears in "Your orders". |
| **Design** | Warm editorial look: Instrument Serif and DM Sans fonts, an ivory/burgundy palette, and pages that work on a phone. |

## How it is built

- **Stack:** Next.js 16 (App Router, Turbopack) with TypeScript and Tailwind CSS v4, deployed on Vercel. Every push to `main` deploys automatically.
- **AI:** Gemini through `@google/genai`, with JSON-schema output and validation. A Claude provider is supported as an alternative.
- **Data:**
  - **Research:** Apify (Instagram profile and post scrapers) for the maker research.
  - **The Drunken Mug:** its public product feed.
  - **Demo catalogue:** 44 products from sample makers.
- **Quality checks:** 68 automated tests (Vitest), covering finder intent, matching, budget/date/area rules, cart pricing, checkout validation, the guided picker, and the data itself. ESLint and a production build run before each push.
- **Optional integration:** orders can be sent to an n8n webhook (`ORDER_WEBHOOK_URL`).

## Timeline (20 commits)

1. **20 Oct:** project set up, design system and homepage.
2. **21 Oct:**
   - catalogue, product and maker pages;
   - Gift Finder, then Gemini;
   - fixed unrelated results;
   - buy/ideas views and gift boxes;
   - online shops;
   - switched to verified Mumbai Instagram makers.
3. **22 Oct:**
   - homepage and results redesign;
   - sign-in;
   - maker products and the full Drunken Mug catalogue;
   - cart, checkout and simulated payment;
   - guided tap-through Gift Finder.

## Honest limitations and next steps

- **Sample catalogue:** GIFTWALA's own catalogue items and their makers are sample data. Real makers and online-shop products are labelled clearly.
- **No real money:** payment is simulated. Next step: Razorpay test mode, with server-side order creation and signature verification.
- **One browser only:** sign-in, cart and orders are saved in the browser (localStorage). Next step: real authentication (Google OAuth or OTP) and a database.
- **Photo permission:** photos from the Instagram makers are credited and linked to the original posts. Each maker is marked "permission pending" until they agree, and one switch hides all unconfirmed photos.
- **Delivery estimates:** they use sample lead times and aren't courier-confirmed.

## Screenshots in this folder

1. **01:** homepage, with the guided Gift Finder in the hero.
2. **02:** Gift Finder, step 1.
3. **03:** results for "birthday gift for my mom, loves coffee and plants, handmade, under ₹2,000, by 29 Oct, Andheri".
4. **04:** the Discover page.
5. **05:** a Mumbai maker page.
6. **06:** The Drunken Mug shop.
7. **07:** the gift box builder.
8. **08:** sign-in.
9. **09:** homepage on a phone.
