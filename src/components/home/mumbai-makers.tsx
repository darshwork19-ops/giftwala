import { instagramMakers, instagramUrl } from "@/data/instagram-makers";

const FEATURED = [
  "ig-tck",
  "ig-giftbyjiggiart",
  "ig-bombay-board",
  "ig-scribble-along",
  "ig-crumbles-by-anokhi",
  "ig-twinkling-crafts",
];

/** Real, independent Mumbai makers (checked on Instagram), as text cards. */
export function MumbaiMakers() {
  const makers = FEATURED.map((id) => instagramMakers.find((m) => m.id === id)).filter((m) => m !== undefined);

  return (
    <section aria-labelledby="mumbai-makers-title" className="bg-linen/50">
      <div className="page-container py-16 lg:py-24">
        <div className="max-w-2xl">
          <h2 id="mumbai-makers-title" className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
            Made in Mumbai
          </h2>
          <p className="mt-4 text-muted">
            Small, independent gifting studios we found and checked on Instagram: active accounts with
            genuine engagement. Order directly with them by DM.
          </p>
        </div>
        <ul className="mt-10 grid gap-px overflow-hidden rounded-xl border border-linen bg-linen sm:grid-cols-2 lg:grid-cols-3">
          {makers.map((maker) => (
            <li key={maker.id} className="bg-ivory">
              <a
                href={instagramUrl(maker.handle)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col p-6 transition-colors hover:bg-white"
              >
                <span className="font-serif text-2xl leading-snug group-hover:text-burgundy">{maker.name}</span>
                <span className="mt-1 text-sm text-burgundy">@{maker.handle}</span>
                <span className="mt-3 text-sm text-muted">{maker.makes}</span>
                <span className="mt-auto pt-5 text-xs text-muted">
                  {maker.followers.toLocaleString("en-IN")} followers · Instagram ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted">
          Followers and engagement checked 21 Oct 2026. These makers don&apos;t list prices; ask them about price and
          delivery.
        </p>
      </div>
    </section>
  );
}
