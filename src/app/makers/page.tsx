import type { Metadata } from "next";
import Link from "next/link";
import { getAllMakers, getProductsByMaker } from "@/lib/catalogue";
import { routes } from "@/lib/routes";
import { getStudioProducts, getStudios } from "@/lib/studios";
import { GiftImage } from "@/components/ui/gift-image";

export const metadata: Metadata = {
  title: "Meet the makers",
  description:
    "The independent potters, paper-makers, chocolatiers, florists and craftspeople behind the gifts on GIFTWALA.",
};

export default function MakersPage() {
  const makers = getAllMakers();
  const studios = getStudios();

  return (
    <div className="page-container py-10 lg:py-14">
      <p className="eyebrow mb-3">Meet the makers</p>
      <h1 className="max-w-3xl font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
        Every gift has a person behind it
      </h1>
      <p className="mt-4 max-w-2xl text-muted sm:text-lg">
        Small studios and kitchens working by hand. Start with real Mumbai makers who sell on Instagram, then
        browse the sample makers behind GIFTWALA&apos;s demo catalogue.
      </p>

      <section aria-labelledby="studios-title" className="mt-14">
        <h2 id="studios-title" className="font-serif text-3xl tracking-tight sm:text-4xl">Made in Mumbai</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Real, independent gifting studios we checked on Instagram (active, with genuine engagement). Each page shows
          what they make; you order from them by DM.
        </p>
        <ul className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {studios.map((studio) => {
            const products = getStudioProducts(studio.id);
            const cover = products.find((p) => p.showPhoto);
            return (
              <li key={studio.id}>
                <Link href={routes.studio(studio.handle)} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[1rem] bg-linen">
                    {cover && (
                      <GiftImage
                        src={cover.image.src}
                        alt={cover.image.alt}
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      />
                    )}
                  </div>
                  <h3 className="mt-4 font-serif text-2xl group-hover:text-burgundy">{studio.name}</h3>
                  <p className="mt-1 text-sm text-burgundy">@{studio.handle}</p>
                  <p className="mt-2 text-sm">{studio.makes}</p>
                  <p className="mt-3 text-xs font-medium text-muted">
                    {products.length} {products.length === 1 ? "gift" : "gifts"} · {studio.followers.toLocaleString("en-IN")} followers
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <h2 className="mt-20 border-t border-linen pt-14 font-serif text-3xl tracking-tight sm:text-4xl">Sample makers</h2>
      <p className="mt-4 inline-block rounded-md bg-blush px-3 py-1.5 text-sm text-berry">
        These makers are sample profiles created for this demo, not real
        businesses.
      </p>

      <ul className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {makers.map((maker, i) => {
          const count = getProductsByMaker(maker.id).length;
          return (
            <li key={maker.id}>
              <Link href={routes.maker(maker.slug)} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-linen">
                  <GiftImage
                    src={maker.image.src}
                    alt={maker.image.alt}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    preload={i < 3}
                    className="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  />
                </div>
                <h3 className="mt-4 font-serif text-2xl group-hover:text-burgundy">
                  {maker.name}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {maker.craft} · {maker.location}
                </p>
                <p className="mt-2 text-sm">{maker.tagline}</p>
                <p className="mt-3 text-xs font-medium text-burgundy">
                  {count} {count === 1 ? "gift" : "gifts"} from this maker
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
