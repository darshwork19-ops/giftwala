import Link from "next/link";
import { occasions } from "@/data/taxonomy";
import { routes } from "@/lib/routes";
import { ArrowRightIcon } from "@/components/ui/icons";

/** Occasion shortcuts as quiet text tiles — no stock photography. */
export function OccasionLinks() {
  return (
    <section aria-labelledby="occasions-title" className="border-t border-linen">
      <div className="page-container py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
          <div>
            <h2 id="occasions-title" className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
              For every occasion
            </h2>
            <p className="mt-4 max-w-sm text-muted">
              Start with the moment, then tell us about the person.
            </p>
          </div>
          <ul className="grid grid-cols-1 border-t border-linen sm:grid-cols-2">
            {occasions.map((o) => (
              <li key={o.id} className="border-b border-linen sm:odd:border-r sm:odd:pr-6 sm:even:pl-6">
                <Link href={routes.giftsForOccasion(o.id)} className="group flex items-center justify-between gap-4 py-5">
                  <span>
                    <span className="block font-serif text-2xl group-hover:text-burgundy">{o.label}</span>
                    <span className="mt-0.5 block text-sm text-muted">{o.blurb}</span>
                  </span>
                  <ArrowRightIcon className="shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-burgundy" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
