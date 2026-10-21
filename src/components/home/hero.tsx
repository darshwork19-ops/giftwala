import { unsplash } from "@/lib/images";
import { routes } from "@/lib/routes";
import { ButtonLink } from "@/components/ui/button";
import { GiftImage } from "@/components/ui/gift-image";
import { DescribeBox } from "@/components/finder/describe-box";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="page-container pt-10 pb-4 sm:pt-14 sm:pb-12 lg:pt-16 lg:pb-20">
      <div className="grid gap-10 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-14 lg:gap-y-10">
        <div className="order-1 lg:order-none lg:self-end">
          <p className="eyebrow mb-5">Handmade gifts from Mumbai makers</p>
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
        </div>

        <div className="relative order-3 lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1">
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

        {/* Under the headline: above the image on phones, beside it on desktop */}
        <div className="order-2 lg:order-none lg:col-start-1 lg:row-start-2">
          <DescribeBox size="lg" />
          <p className="mt-4 text-sm">
            Rather browse?{" "}
            <ButtonLink href={routes.gifts} variant="ghost" className="align-baseline">
              Explore all gifts
            </ButtonLink>
          </p>
        </div>
      </div>
    </section>
  );
}
