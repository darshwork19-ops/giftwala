import { countProductsWithOption } from "@/lib/catalogue";
import { unsplash } from "@/lib/images";
import { routes } from "@/lib/routes";
import { ButtonLink } from "@/components/ui/button";
import { GiftImage } from "@/components/ui/gift-image";

/** Examples are counted from the catalogue so the numbers stay honest. */
const examples = [
  {
    optionId: "gift-message",
    title: "A handwritten gift message",
    body: "Written on a card by the maker and tucked inside.",
  },
  {
    optionId: "recipient-name",
    title: "Their name on the label",
    body: "Printed on the tag of selected candles, hampers and treats.",
  },
  {
    optionId: "engraving",
    title: "Engraving or monograms",
    body: "On pens, journals, lamps and more. Usually adds a few days.",
  },
  {
    optionId: "packaging",
    title: "Gift wrapping",
    body: "Textured paper and a burgundy ribbon, where the maker offers it.",
  },
];

export function PersonaliseIntro() {
  return (
    <section aria-labelledby="personalise-title" className="page-container py-16 lg:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative order-last aspect-[4/3] overflow-hidden rounded-lg bg-linen lg:order-first lg:aspect-[4/5]">
          <GiftImage
            src={unsplash("photo-1638560927109-062a7e7bdf03")}
            alt="A present wrapped in brown paper with a blank tag tied on with twine"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
        <div>
          <p className="eyebrow mb-3">Make it personal</p>
          <h2
            id="personalise-title"
            className="font-serif text-3xl leading-tight tracking-tight sm:text-4xl"
          >
            The small details they&apos;ll remember
          </h2>
          <p className="mt-4 text-muted sm:text-lg">
            Each maker decides what they can personalise, so options vary from
            gift to gift. You&apos;ll only see the choices a product supports,
            along with any extra cost or time.
          </p>
          <ul className="mt-8 divide-y divide-linen border-y border-linen">
            {examples.map((ex) => {
              const count = countProductsWithOption(ex.optionId);
              return (
                <li key={ex.optionId} className="flex gap-4 py-4">
                  <div className="flex-1">
                    <p className="font-medium">{ex.title}</p>
                    <p className="mt-0.5 text-sm text-muted">{ex.body}</p>
                  </div>
                  <p className="shrink-0 self-center text-sm text-burgundy">
                    {count} gifts
                  </p>
                </li>
              );
            })}
          </ul>
          <ButtonLink href={routes.personalisedGifts} className="mt-8">
            Explore personalisable gifts
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
