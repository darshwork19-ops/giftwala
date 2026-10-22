"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import type { CartSummary } from "@/lib/checkout";
import { todayInIndia } from "@/lib/finder/dates";
import { formatPrice } from "@/lib/format";
import { useProfile, type Profile } from "@/lib/profile";
import { routes } from "@/lib/routes";
import { GiftImage } from "@/components/ui/gift-image";

export const fieldClass =
  "h-12 w-full rounded-xl border border-charcoal/15 bg-white px-4 text-[0.95rem] placeholder:text-muted/70 focus:border-burgundy focus:outline-none aria-[invalid=true]:border-berry";
export const primaryPill =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-burgundy px-6 text-sm font-medium text-white transition-colors hover:bg-burgundy-hover disabled:cursor-not-allowed disabled:opacity-60";
export const secondaryPill =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-charcoal/20 px-6 text-sm font-medium transition-colors hover:border-burgundy hover:text-burgundy";

const noopSubscribe = () => () => {};

/** Today's date in India, read on the client only (it differs from build time). */
export function useToday(): string | null {
  return useSyncExternalStore(noopSubscribe, () => todayInIndia(), () => null);
}

/** Checkout needs a signed-in profile; signed-out visitors go to the login page first. */
export function useRequireProfile(): Profile | null | undefined {
  const profile = useProfile();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const here = `${pathname}${params.size ? `?${params}` : ""}`;
  useEffect(() => {
    if (profile === null) router.replace(routes.loginThen(here));
  }, [profile, router, here]);
  return profile;
}

const STEPS = [
  { label: "Cart", href: routes.cart },
  { label: "Address", href: routes.checkout },
  { label: "Review", href: routes.checkoutReview },
  { label: "Payment", href: routes.checkoutPay },
];

export function CheckoutSteps({ current }: { current: 0 | 1 | 2 | 3 }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm" aria-label="Checkout steps">
      {STEPS.map((s, i) => (
        <li key={s.label} className="flex items-center gap-3">
          {i < current ? (
            <Link href={s.href} className="text-muted underline decoration-linen underline-offset-4 hover:text-burgundy">
              {s.label}
            </Link>
          ) : (
            <span aria-current={i === current ? "step" : undefined} className={i === current ? "font-medium text-burgundy" : "text-muted/70"}>
              {i + 1}. {s.label}
            </span>
          )}
          {i < STEPS.length - 1 && <span aria-hidden="true" className="h-px w-6 bg-linen" />}
        </li>
      ))}
    </ol>
  );
}

export function PageTitle({ eyebrow, title, accent }: { eyebrow?: string; title: string; accent?: string }) {
  return (
    <>
      {eyebrow && <p className="mb-3 text-sm tracking-wide text-muted">{eyebrow}</p>}
      <h1 className="font-serif text-[2.4rem] leading-[1.05] tracking-tight sm:text-5xl">
        {title} {accent && <span className="text-burgundy italic">{accent}</span>}
      </h1>
    </>
  );
}

/** The order summary shown beside every checkout step. */
export function OrderSummary({ cart, children }: { cart: CartSummary; children?: React.ReactNode }) {
  return (
    <aside aria-labelledby="summary-title" className="rounded-[1.25rem] border border-linen bg-white/70 p-6 lg:sticky lg:top-28 lg:self-start">
      <h2 id="summary-title" className="font-serif text-2xl">Order summary</h2>
      <ul className="mt-5 space-y-4">
        {cart.lines.map((l) => (
          <li key={l.line.id} className="flex gap-3">
            <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-linen">
              <GiftImage src={l.image.src} alt="" sizes="56px" />
            </span>
            <span className="min-w-0 flex-1 text-sm">
              <span className="block leading-snug">{l.name}</span>
              <span className="block text-xs text-muted">Qty {l.line.quantity}</span>
            </span>
            <span className="text-sm">{formatPrice(l.total)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-5 space-y-2 border-t border-linen pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd>{formatPrice(cart.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Delivery</dt>
          <dd>{cart.delivery ? formatPrice(cart.delivery) : "Free"}</dd>
        </div>
        <div className="flex justify-between border-t border-linen pt-3 text-base font-medium">
          <dt>Total</dt>
          <dd>{formatPrice(cart.total)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-muted">No delivery charges are set for the sample makers.</p>
      {children}
    </aside>
  );
}

export function Field({ id, label, hint, error, className = "", children }: {
  id: string; label: string; hint?: string; error?: string; className?: string; children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={`co-${id}`} className="mb-1.5 block pl-1 text-sm font-medium">{label}</label>
      {children}
      {hint && !error && <p className="mt-1.5 pl-1 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1.5 pl-1 text-xs font-medium text-berry" role="alert">{error}</p>}
    </div>
  );
}

export function DemoNotice() {
  return (
    <p className="rounded-xl bg-blush px-4 py-3 text-sm text-berry">
      Demo checkout: GIFTWALA&apos;s catalogue gifts are sample products, and the payment step is simulated. No real
      money is taken and nothing is shipped.
    </p>
  );
}

export function Skeleton() {
  return <div className="h-96 animate-pulse rounded-[1.25rem] bg-linen/60" />;
}

/** Sends the visitor elsewhere (e.g. back to an empty cart) after render. */
export function Redirect({ to }: { to: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(to);
  }, [router, to]);
  return <Skeleton />;
}
