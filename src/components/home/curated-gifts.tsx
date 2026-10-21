import Link from "next/link";
import { getFeaturedProducts } from "@/lib/catalogue";
import { routes } from "@/lib/routes";
import { ArrowRightIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductCard } from "@/components/product/product-card";

export function CuratedGifts() {
  const products = getFeaturedProducts(8);

  return (
    <section aria-labelledby="curated-title" className="page-container py-16 lg:py-20">
      <SectionHeading
        id="curated-title"
        eyebrow="Curated gifts"
        title="A few we keep coming back to"
        description="Listings from the GIFTWALA demo catalogue. Makers and products are sample data."
        action={
          <Link
            href={routes.gifts}
            className="inline-flex items-center gap-2 text-sm font-medium text-burgundy underline-offset-4 hover:underline"
          >
            Explore all gifts
            <ArrowRightIcon width={16} height={16} />
          </Link>
        }
      />
      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
        {products.map((product) => (
          <li key={product.id} className="flex">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
