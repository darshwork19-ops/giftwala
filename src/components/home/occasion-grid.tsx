import Link from "next/link";
import { occasions } from "@/data/taxonomy";
import { routes } from "@/lib/routes";
import { GiftImage } from "@/components/ui/gift-image";
import { SectionHeading } from "@/components/ui/section-heading";

export function OccasionGrid() {
  return (
    <section aria-labelledby="occasions-title" className="page-container py-16 lg:py-20">
      <SectionHeading
        id="occasions-title"
        eyebrow="Shop by occasion"
        title="What are you celebrating?"
      />
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-5">
        {occasions.map((occasion) => (
          <li key={occasion.id}>
            <Link href={routes.giftsForOccasion(occasion.id)} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-linen">
                <GiftImage
                  src={occasion.image.src}
                  alt={occasion.image.alt}
                  sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                  className="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
              </div>
              <p className="mt-3 font-serif text-xl group-hover:text-burgundy">
                {occasion.label}
              </p>
              <p className="mt-0.5 text-sm text-muted">{occasion.blurb}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
