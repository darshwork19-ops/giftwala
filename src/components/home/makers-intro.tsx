import Link from "next/link";
import { getAllMakers, getProductsByMaker } from "@/lib/catalogue";
import { routes } from "@/lib/routes";
import { ButtonLink } from "@/components/ui/button";
import { GiftImage } from "@/components/ui/gift-image";

const FEATURED_MAKER_IDS = ["mitti-studio", "kaagaz-and-co", "saanjh-candles"];

export function MakersIntro() {
  const makers = getAllMakers().filter((m) => FEATURED_MAKER_IDS.includes(m.id));

  return (
    <section aria-labelledby="makers-title" className="bg-linen/60">
      <div className="page-container grid gap-12 py-16 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-4">
          <p className="eyebrow mb-3">Meet the makers</p>
          <h2
            id="makers-title"
            className="font-serif text-3xl leading-tight tracking-tight sm:text-4xl"
          >
            Every gift has a person behind it
          </h2>
          <p className="mt-4 text-muted sm:text-lg">
            Potters, paper-makers, chocolatiers and florists working in small
            studios. Each gift shows who made it, so you can see where it comes
            from.
          </p>
          <ButtonLink href={routes.makers} variant="secondary" className="mt-8">
            Meet all the makers
          </ButtonLink>
          <p className="mt-6 text-xs text-muted">
            The makers shown here are sample profiles for this demo.
          </p>
        </div>

        <ul className="grid gap-8 sm:grid-cols-3 lg:col-span-8 lg:gap-6">
          {makers.map((maker) => {
            const count = getProductsByMaker(maker.id).length;
            return (
              <li key={maker.id}>
                <Link href={routes.maker(maker.slug)} className="group block">
                  <div className="relative aspect-square overflow-hidden rounded-md bg-linen">
                    <GiftImage
                      src={maker.image.src}
                      alt={maker.image.alt}
                      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 100vw"
                      className="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                  <p className="mt-4 font-serif text-xl group-hover:text-burgundy">
                    {maker.name}
                  </p>
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
    </section>
  );
}
