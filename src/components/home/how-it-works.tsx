import { routes } from "@/lib/routes";
import { ButtonLink } from "@/components/ui/button";

const STEPS = [
  {
    title: "Describe the person",
    body: "What they love, their hobbies and personality, plus a budget if you have one. You don't need to know the product.",
  },
  {
    title: "See what fits",
    body: "Gifts that match what you told us, each with a reason, plus clearly labelled ideas for things we don't stock.",
  },
  {
    title: "Get it to them",
    body: "Request a GIFTWALA gift or box, buy from the shop, or message a Mumbai maker. Delivery is only estimated where we have data.",
  },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how-title" className="border-t border-linen">
      <div className="page-container py-16 lg:py-24">
        <h2 id="how-title" className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
          How it works
        </h2>
        <ol className="mt-10 grid gap-10 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <span aria-hidden="true" className="font-serif text-5xl text-terracotta">
                {i + 1}
              </span>
              <h3 className="mt-3 text-lg font-medium">{step.title}</h3>
              <p className="mt-2 text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={routes.giftFinder} size="lg">
            Find their perfect gift
          </ButtonLink>
          <ButtonLink href={routes.giftBox} size="lg" variant="secondary">
            Build a gift box
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
