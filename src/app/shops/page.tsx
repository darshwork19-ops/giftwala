import type { Metadata } from "next";
import Link from "next/link";
import { externalProducts, shops } from "@/data/external-products";
import { ShopProductCard } from "@/components/shop/shop-product-card";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Small Indian brands",
  description: "Coffee, tea, yoga, trekking, cricket, pets, plants, candles and more from small independent Indian brands.",
};

export default function ShopsPage() {
  const brands = shops
    .filter((s) => s.id !== "drunken-mug")
    .map((shop) => ({ shop, items: externalProducts.filter((p) => p.shopId === shop.id) }))
    .filter((b) => b.items.length > 0);

  return (
    <div className="page-container pt-12 pb-20 sm:pt-16">
      <p className="mb-4 text-sm tracking-wide text-muted">From online shops</p>
      <h1 className="max-w-3xl font-serif text-[2.6rem] leading-[1.05] tracking-tight sm:text-6xl">
        Small Indian brands. <span className="text-burgundy italic">Not the big names.</span>
      </h1>
      <p className="mt-5 max-w-2xl text-muted">
        {brands.length} independent brands, sold on their own sites, not by GIFTWALA: prices are as we last checked
        them, and stock, delivery, payment and returns are handled by each brand. Photos appear once a brand confirms
        we can show them. Also see{" "}
        <Link href={routes.drunkenMug} className="underline decoration-linen underline-offset-4 hover:text-burgundy">
          The Drunken Mug
        </Link>
        .
      </p>
      <nav aria-label="Jump to" className="mt-8 flex flex-wrap gap-2 text-sm">
        {brands.map(({ shop }) => (
          <a
            key={shop.id}
            href={`#${shop.id}`}
            className="rounded-full border border-linen px-3 py-1 text-muted transition-colors hover:border-charcoal hover:text-charcoal"
          >
            {shop.name}
          </a>
        ))}
      </nav>
      {brands.map(({ shop, items }) => (
        <section key={shop.id} id={shop.id} aria-labelledby={`${shop.id}-title`} className="mt-14 scroll-mt-28 border-t border-linen pt-12">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id={`${shop.id}-title`} className="font-serif text-3xl tracking-tight sm:text-4xl">
                {shop.name}
              </h2>
              <p className="mt-2 text-sm text-muted">{items[0].summary}</p>
            </div>
            <a
              href={shop.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-charcoal underline decoration-linen underline-offset-4 hover:text-burgundy hover:decoration-burgundy"
            >
              Visit {shop.name} ↗
            </a>
          </div>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
            {items.map((p) => (
              <li key={p.id}>
                <ShopProductCard product={p} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
