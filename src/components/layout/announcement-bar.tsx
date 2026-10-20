import Link from "next/link";
import { routes } from "@/lib/routes";

export function AnnouncementBar() {
  return (
    <div className="bg-burgundy text-white">
      <p className="page-container py-2 text-center text-xs tracking-wide sm:text-[0.8rem]">
        Add a name, a note or an engraving on selected gifts.{" "}
        <Link
          href={routes.personalisedGifts}
          className="font-medium underline underline-offset-4 hover:no-underline"
        >
          See what can be personalised
        </Link>
      </p>
    </div>
  );
}
