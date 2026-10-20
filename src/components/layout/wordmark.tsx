import Link from "next/link";
import { routes } from "@/lib/routes";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link
      href={routes.home}
      className={`font-serif text-xl font-medium tracking-[0.2em] text-burgundy sm:text-2xl ${className}`}
      aria-label="GIFTWALA home"
    >
      GIFTWALA
    </Link>
  );
}
