import Link from "next/link";
import { routes } from "@/lib/routes";

export function AnnouncementBar() {
  return (
    <div className="border-b border-linen bg-linen/60 text-charcoal">
      <p className="page-container py-2 text-center text-xs tracking-wide sm:text-[0.8rem]">
        Describe the person, not the product, and we&apos;ll suggest gifts that fit.{" "}
        <Link
          href={routes.giftFinder}
          className="font-medium text-burgundy underline underline-offset-4 hover:no-underline"
        >
          Try the Gift Finder
        </Link>
      </p>
    </div>
  );
}
