import Link from "next/link";
import { externalProducts } from "@/data/external-products";
import { routes } from "@/lib/routes";
import { ShopProductCard } from "@/components/shop/shop-product-card";
import { ArrowRightIcon } from "@/components/ui/icons";

// A spread of mugs, sets and serveware rather than eight similar glasses
const PICKS = ["x-tdm-old-monk-mug", "x-tdm-jager-platter", "x-tdm-ballantines-jug", "x-tdm-toothpick-holder"];

export function DrunkenMugStrip() {
  const picks = PICKS.map((id) => externalProducts.find((p) => p.id === id)).filter((p) => p !== undefined);
  const count = externalProducts.filter((p) => p.shopId === "drunken-mug").length;
  return (
    <section aria-labelledby="tdm-title" className="border-t border-linen">
      <div className="page-container py-16 lg:py-20">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <h2 id="tdm-title" className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
              From The Drunken Mug
            </h2>
            <p className="mt-3 text-muted">
              Glassware cut from reclaimed bottles, sold on their own site. Prices as we last checked.
            </p>
          </div>
          <Link href={routes.drunkenMug} className="inline-flex items-center gap-1.5 text-sm font-medium text-charcoal underline decoration-linen underline-offset-4 hover:text-burgundy hover:decoration-burgundy">
            See all {count} pieces <ArrowRightIcon width={15} height={15} />
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {picks.map((p) => (
            <li key={p.id}>
              <ShopProductCard product={p} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
