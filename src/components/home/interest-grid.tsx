import Link from "next/link";
import { routes } from "@/lib/routes";
import { SectionHeading } from "@/components/ui/section-heading";

/** Each tile starts the Gift Finder with a short description of the person. */
export const INTERESTS: { label: string; hint: string; brief: string }[] = [
  { label: "Sports", hint: "Cricket, badminton, football", brief: "They love cricket and playing sports" },
  { label: "Travel & adventure", hint: "Treks, trips, thrills", brief: "They're adventurous and love travelling" },
  { label: "Books & study", hint: "Readers, students", brief: "They're a big reader and studying for exams" },
  { label: "Technology", hint: "Gadgets, coding", brief: "They're into tech and gadgets" },
  { label: "Cars", hint: "Models, motorsport", brief: "They love cars and racing" },
  { label: "Gaming", hint: "Console, PC, mobile", brief: "They're a gamer" },
  { label: "Music", hint: "Gigs, instruments", brief: "They love music and play the guitar" },
  { label: "Arts", hint: "Drawing, pottery, craft", brief: "They love drawing, painting and pottery" },
  { label: "Outdoors", hint: "Hiking, plants, nature", brief: "They love hiking and plants" },
  { label: "Food", hint: "Coffee, baking, cooking", brief: "They love coffee, chocolate and cooking" },
];

export function InterestGrid() {
  return (
    <section aria-labelledby="interests-title" className="page-container py-16 lg:py-20">
      <SectionHeading
        id="interests-title"
        eyebrow="Start with what they love"
        title="Gifts by interest, not by aisle"
        description="Pick what they're into and the Gift Finder suggests matching gifts and ideas across categories."
      />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {INTERESTS.map((interest) => (
          <li key={interest.label}>
            <Link
              href={routes.giftFinderFor(interest.brief)}
              className="flex h-full flex-col rounded-md border border-linen bg-white px-4 py-4 transition-colors hover:border-burgundy"
            >
              <span className="font-serif text-lg">{interest.label}</span>
              <span className="mt-1 text-xs text-muted">{interest.hint}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
