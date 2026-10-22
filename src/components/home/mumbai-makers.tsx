import Link from "next/link";
import { routes } from "@/lib/routes";
import { getStudioProducts, getStudios } from "@/lib/studios";
import { GiftImage } from "@/components/ui/gift-image";
import { ArrowRightIcon } from "@/components/ui/icons";

const FEATURED = [
  "ig-tck",
  "ig-giftbyjiggiart",
  "ig-bombay-board",
  "ig-scribble-along",
  "ig-crumbles-by-anokhi",
  "ig-decor-designs-by-tash",
];

/** Real, independent Mumbai makers (checked on Instagram), shown with their work. */
export function MumbaiMakers() {
  const all = getStudios();
  const makers = FEATURED.map((id) => all.find((m) => m.id === id)).filter((m) => m !== undefined);

  return (
    <section aria-labelledby="mumbai-makers-title" className="bg-linen/50">
      <div className="page-container py-16 lg:py-24">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2 id="mumbai-makers-title" className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
              Made in Mumbai
            </h2>
            <p className="mt-4 text-muted">
              Small, independent gifting studios we found and checked on Instagram. See what they make here, then
              order from them directly.
            </p>
          </div>
          <Link href={routes.makers} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-charcoal underline decoration-charcoal/20 underline-offset-4 hover:text-burgundy hover:decoration-burgundy">
            All {all.length} Mumbai makers <ArrowRightIcon width={15} height={15} />
          </Link>
        </div>
        <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {makers.map((maker) => {
            const products = getStudioProducts(maker.id);
            const cover = products.find((p) => p.showPhoto);
            return (
              <li key={maker.id}>
                <Link href={routes.studio(maker.handle)} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[1rem] bg-linen">
                    {cover && (
                      <GiftImage
                        src={cover.image.src}
                        alt={cover.image.alt}
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <p className="mt-4 font-serif text-2xl leading-snug group-hover:text-burgundy">{maker.name}</p>
                  <p className="mt-1 text-sm text-muted">{maker.makes}</p>
                  <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-charcoal">
                    See {products.length} {products.length === 1 ? "gift" : "gifts"}
                    <ArrowRightIcon width={15} height={15} className="transition-transform group-hover:translate-x-1" />
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="mt-8 text-xs text-muted">
          Photos are from each maker&apos;s Instagram posts, credited to them. These makers don&apos;t list prices; ask
          them about price and delivery.
        </p>
      </div>
    </section>
  );
}
