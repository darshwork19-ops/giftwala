import Link from "next/link";
import { instagramPostUrl, type MakerProduct } from "@/data/instagram-maker-products";
import type { InstagramMaker } from "@/data/instagram-makers";
import { routes } from "@/lib/routes";
import { GiftImage } from "@/components/ui/gift-image";

interface MakerProductCardProps {
  product: MakerProduct;
  maker: InstagramMaker;
  showPhoto: boolean;
  /** Show the maker's name above the product (for mixed lists). */
  showMaker?: boolean;
  priority?: boolean;
}

/**
 * A product a Mumbai maker shows on Instagram. No price or delivery is listed
 * because the maker sells by DM; the photo is credited and links to the post.
 */
export function MakerProductCard({ product, maker, showPhoto, showMaker = false, priority = false }: MakerProductCardProps) {
  const postUrl = instagramPostUrl(product.postCode);
  return (
    <article className="group flex h-full flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1rem] bg-linen">
        {showPhoto ? (
          <GiftImage
            src={product.image.src}
            alt={product.image.alt}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            preload={priority}
            className="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center font-serif text-xl text-muted">
            {product.category}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col pt-3">
        <p className="text-xs text-muted">
          {showMaker ? (
            <Link href={routes.studio(maker.handle)} className="hover:text-burgundy">
              {maker.name}
            </Link>
          ) : (
            product.category
          )}
          {showPhoto && (
            <>
              {" · "}
              <span>Photo @{maker.handle}</span>
            </>
          )}
        </p>
        <h3 className="mt-1.5 font-serif text-lg leading-snug">{product.name}</h3>
        <p className="mt-1.5 text-sm text-muted">{product.summary}</p>
        <p className="mt-3 text-xs text-charcoal">Price on request · order by Instagram DM</p>
        <a
          href={postUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto self-start pt-3 text-sm font-medium text-charcoal underline decoration-linen underline-offset-4 hover:text-burgundy hover:decoration-burgundy"
        >
          View post on Instagram ↗
        </a>
      </div>
    </article>
  );
}
