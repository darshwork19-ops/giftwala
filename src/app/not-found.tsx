import type { Metadata } from "next";
import { routes } from "@/lib/routes";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <section className="page-container flex flex-col items-center py-24 text-center sm:py-32">
      <p className="eyebrow mb-4">Page not found</p>
      <h1 className="max-w-xl font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-4 max-w-md text-muted">
        It may have moved, or it may not be built yet. GIFTWALA is a work in
        progress and new pages are being added.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href={routes.home}>Back to the homepage</ButtonLink>
        <ButtonLink href={routes.gifts} variant="secondary">
          Explore all gifts
        </ButtonLink>
      </div>
    </section>
  );
}
