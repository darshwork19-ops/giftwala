import Link from "next/link";
import { getFeaturedProducts } from "@/lib/catalogue";
import { routes } from "@/lib/routes";
import { ProductCard } from "@/components/product/product-card";
import { ArrowRightIcon } from "@/components/ui/icons";

/** A photo-led first look at the catalogue, right under the hero. */
export function PopularGifts() {
  const products = getFeaturedProducts(8);
  return (
    <section aria-labelledby="popular-title" className="border-t border-linen">
      <div className="page-container py-16 lg:py-20">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <h2 id="popular-title" className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
              Gifts people love
            </h2>
            <p className="mt-3 text-muted">Handmade, personal and ready to request. Sample listings for this demo.</p>
          </div>
          <Link href={routes.gifts} className="inline-flex items-center gap-1.5 text-sm font-medium text-charcoal underline decoration-linen underline-offset-4 hover:text-burgundy hover:decoration-burgundy">
            Explore all gifts <ArrowRightIcon width={15} height={15} />
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {products.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
