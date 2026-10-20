import Link from "next/link";
import { getMaker, isPersonalisable } from "@/lib/catalogue";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { Product } from "@/lib/types";
import { GiftImage } from "@/components/ui/gift-image";
import { PenIcon } from "@/components/ui/icons";

interface ProductCardProps {
  product: Product;
  /** Pass true for cards visible on first paint, so the image loads eagerly. */
  priority?: boolean;
}

/**
 * The whole card links to the product (via a stretched link on the name);
 * the maker name sits above that layer and links to the maker profile.
 */
export function ProductCard({ product, priority = false }: ProductCardProps) {
  const maker = getMaker(product.makerId);
  const image = product.images[0];

  return (
    <article className="group relative flex w-full flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-linen">
        <GiftImage
          src={image.src}
          alt={image.alt}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          preload={priority}
          className="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col pt-4">
        <Link
          href={routes.maker(maker.slug)}
          className="relative z-10 self-start text-xs tracking-wide text-muted uppercase hover:text-burgundy"
        >
          {maker.name}
        </Link>
        <h3 className="mt-1.5 text-[0.95rem] leading-snug font-medium">
          <Link
            href={routes.product(product.slug)}
            className="after:absolute after:inset-0 after:content-[''] group-hover:text-burgundy"
          >
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-2">
          <p className="text-[0.95rem] font-semibold">{formatPrice(product.price)}</p>
          {isPersonalisable(product) && (
            <p className="inline-flex items-center gap-1 text-xs text-burgundy">
              <PenIcon width={14} height={14} />
              Personalisable
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
