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

## Not connected

There is no backend, database, payment provider or AI model connected.
Recommendations, cart and checkout (when built) run locally and are labelled as
demo functionality in the interface.

## Build status

Phases 1–2 of the build plan are done: design system, branding, header,
footer and homepage. Pages for the catalogue, product details, makers, Gift
Finder, favourites, cart and checkout are next; until then those links show
the branded "page not found" screen.
