import Link from "next/link";
import { unsplash } from "@/lib/images";
import { routes } from "@/lib/routes";
import { GiftImage } from "@/components/ui/gift-image";
import { HeroSearch } from "./hero-search";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="page-container pt-12 pb-16 sm:pt-16 lg:pt-20 lg:pb-24">
      <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
        <div>
          <p className="mb-6 text-sm tracking-wide text-muted">Gift discovery, made personal</p>
          <h1
            id="hero-title"
            className="font-serif text-[3rem] leading-[1.02] tracking-tight sm:text-7xl lg:text-[5.5rem]"
          >
            Know the person.
            <br />
            <span className="text-burgundy italic">Find the gift that feels like them.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted">
            Tell us what makes them different. We&apos;ll help you find a gift that fits.
          </p>

          <HeroSearch />

          <p className="mt-6 text-sm text-muted">
            Or{" "}
            <Link href={routes.gifts} className="text-charcoal underline underline-offset-4 hover:text-burgundy">
              explore gifts
            </Link>{" "}
            ·{" "}
            <Link href={routes.giftBox} className="text-charcoal underline underline-offset-4 hover:text-burgundy">
              build a gift box
            </Link>
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-linen">
            <GiftImage
              src={unsplash("photo-1788713756143-fcfc915940f0")}
              alt="A hand holding a small brown-paper parcel tied with twine and a red seal"
              sizes="(min-width: 1024px) 40vw, 90vw"
              preload
            />
          </div>
        </div>
      </div>
    </section>
  );
}
