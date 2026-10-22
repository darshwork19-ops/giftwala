import Link from "next/link";
import { occasions } from "@/data/taxonomy";
import { routes } from "@/lib/routes";
import { Wordmark } from "./wordmark";

const columns: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { href: routes.giftFinder, label: "Gift Finder" },
      { href: routes.gifts, label: "All gifts" },
      { href: routes.giftBox, label: "Build a gift box" },
      { href: routes.personalisedGifts, label: "Personalised gifts" },
      { href: routes.cart, label: "Your cart" },
      { href: routes.orders, label: "Your orders" },
    ],
  },
  {
    title: "Occasions",
    links: occasions.map((o) => ({
      href: routes.giftsForOccasion(o.id),
      label: o.label,
    })),
  },
  {
    title: "Makers",
    links: [{ href: routes.makers, label: "Meet the Makers" }],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-linen bg-linen/50">
      <div className="page-container py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <Wordmark />
            <p className="mt-4 text-sm text-muted">
              Thoughtful finds from independent makers, chosen with care and
              made personal.
            </p>
          </div>
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="mb-4 text-xs font-semibold tracking-[0.14em] uppercase">
                {col.title}
              </h2>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-burgundy"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-charcoal/10 pt-6 text-xs text-muted sm:flex-row sm:justify-between">
          <p>© GIFTWALA. A student hackathon project.</p>
          <p>
            Makers, products and prices shown are sample data for demonstration.
          </p>
        </div>
      </div>
    </footer>
  );
}
