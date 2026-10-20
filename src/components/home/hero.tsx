import { unsplash } from "@/lib/images";
import { routes } from "@/lib/routes";
import { ButtonLink } from "@/components/ui/button";
import { GiftImage } from "@/components/ui/gift-image";
import { GiftFinderEntry } from "./gift-finder-entry";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="page-container pt-10 pb-4 sm:pt-14 sm:pb-12 lg:pt-16 lg:pb-20">
      <div className="grid gap-10 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-14 lg:gap-y-10">
        <div className="lg:self-end">
          <p className="eyebrow mb-5">Gifts from independent makers</p>
          <h1
            id="hero-title"
            className="font-serif text-[2.6rem] leading-[1.05] font-normal tracking-tight sm:text-6xl lg:text-[4.25rem]"
          >
            It&apos;s not just a gift.{" "}
            <em className="text-burgundy not-italic sm:italic">
              It&apos;s how you make them feel.
            </em>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted">
            Thoughtful finds from independent makers, chosen with care and made
            personal.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={routes.giftFinder} size="lg">
              Find their perfect gift
            </ButtonLink>
            <ButtonLink href={routes.gifts} size="lg" variant="secondary">
              Explore all gifts
            </ButtonLink>
          </div>
        </div>

        <div className="relative lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div
            aria-hidden="true"
            className="absolute -right-3 -bottom-3 hidden h-full w-full rounded-lg border border-terracotta/70 sm:block lg:-right-5 lg:-bottom-5"
          />
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-linen sm:aspect-[5/4] lg:aspect-auto lg:h-full lg:min-h-[32rem]">
            <GiftImage
              src={unsplash("photo-1509024102370-fd7802f4a7a7")}
              alt="A book wrapped in grey paper and tied with a red ribbon, beside a lit tealight candle"
              sizes="(min-width: 1024px) 50vw, 100vw"
              preload
            />
          </div>
        </div>

        {/* Below the image on small screens; under the headline on desktop */}
        <div className="lg:col-start-1 lg:row-start-2">
          <GiftFinderEntry />
        </div>
      </div>
    </section>
  );
}
