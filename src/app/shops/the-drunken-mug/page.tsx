import type { Metadata } from "next";
import { externalProducts, getShop } from "@/data/external-products";
import { ShopProductCard } from "@/components/shop/shop-product-card";

export const metadata: Metadata = {
  title: "The Drunken Mug · upcycled glassware",
  description: "Glasses, mugs, jugs, jars and platters cut from reclaimed bottles, from The Drunken Mug.",
};

// Gifts people reach for first, then the rest of the shop
const ORDER = ["Mugs", "Glassware", "Jugs", "Platters", "Jars & storage", "Candles", "Bar tools", "Home & table", "Barware"];

export default function DrunkenMugPage() {
  const shop = getShop("drunken-mug");
  const products = externalProducts.filter((p) => p.shopId === shop.id);
  const groups = [...new Set(products.map((p) => p.category))]
    .sort((a, b) => (ORDER.indexOf(a) + 99) % 99 - (ORDER.indexOf(b) + 99) % 99)
    .map((category) => ({ category, items: products.filter((p) => p.category === category) }));

  return (
    <div className="page-container pt-12 pb-20 sm:pt-16">
      <p className="mb-4 text-sm tracking-wide text-muted">From an online shop</p>
      <h1 className="max-w-3xl font-serif text-[2.6rem] leading-[1.05] tracking-tight sm:text-6xl">
        The Drunken Mug. <span className="text-burgundy italic">Bottles, given a second pour.</span>
      </h1>
      <p className="mt-5 max-w-2xl text-muted">
        {products.length} pieces of glassware cut from reclaimed bottles. They&apos;re sold by The Drunken Mug, not
        GIFTWALA: prices are as we last checked them, and stock, delivery, payment and returns are handled by the shop.
        Pieces marked 18+ carry liquor branding and are meant for adults.
      </p>
      <nav aria-label="Jump to" className="mt-8 flex flex-wrap gap-2 text-sm">
        {groups.map((g) => (
          <a
            key={g.category}
            href={`#${slug(g.category)}`}
            className="rounded-full border border-linen px-3 py-1 text-muted transition-colors hover:border-charcoal hover:text-charcoal"
          >
            {g.category} ({g.items.length})
          </a>
        ))}
      </nav>
      {groups.map((g, gi) => (
        <section key={g.category} id={slug(g.category)} aria-labelledby={`${slug(g.category)}-title`} className="mt-14 scroll-mt-28 border-t border-linen pt-12">
          <h2 id={`${slug(g.category)}-title`} className="mb-8 font-serif text-3xl tracking-tight sm:text-4xl">
            {g.category}
          </h2>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
            {g.items.map((p, i) => (
              <li key={p.id}>
                <ShopProductCard product={p} priority={gi === 0 && i < 4} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
