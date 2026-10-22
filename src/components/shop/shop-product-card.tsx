import { getShop, type ExternalProduct } from "@/data/external-products";
import { formatShortDate } from "@/lib/finder/dates";
import { formatPrice } from "@/lib/format";
import { GiftImage } from "@/components/ui/gift-image";
import { AiIllustration } from "@/components/ui/ai-illustration";
import { illustrationFor } from "@/data/illustrations";

/** A product sold on another shop's website; buying happens there. */
export function ShopProductCard({ product, priority = false }: { product: ExternalProduct; priority?: boolean }) {
  const shop = getShop(product.shopId);
  return (
    <article className="group flex h-full flex-col">
      <a href={product.url} target="_blank" rel="noopener noreferrer" className="block">
        <div className="relative aspect-square overflow-hidden rounded-[1rem] border border-linen bg-white">
          {shop.photoPermission === "granted" ? (
            <GiftImage
              src={product.image.src}
              alt={product.image.alt}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              preload={priority}
              className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <AiIllustration theme={illustrationFor(product)} />
          )}
        </div>
      </a>
      <div className="flex flex-1 flex-col pt-3">
        <p className="text-xs text-muted">
          {shop.name} · {product.category}
          {product.adultsOnly && (
            <span className="ml-1.5 rounded-full border border-charcoal/20 px-2 py-0.5 text-[0.7rem] text-charcoal">18+</span>
          )}
        </p>
        <h3 className="mt-1.5 font-serif text-lg leading-snug">{product.name}</h3>
        <p className="mt-2 text-[0.95rem] font-medium">{formatPrice(product.price)}</p>
        <p className="mt-0.5 text-xs text-muted">Price checked {formatShortDate(product.priceCheckedOn)} · may have changed</p>
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto self-start pt-3 text-sm font-medium text-charcoal underline decoration-linen underline-offset-4 hover:text-burgundy hover:decoration-burgundy"
        >
          Buy on {shop.name} ↗
        </a>
      </div>
    </article>
  );
}
