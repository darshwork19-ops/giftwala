"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useState, useSyncExternalStore, type FormEvent } from "react";
import { addGift, rememberDeliveryHints } from "@/lib/cart";
import { priceLine } from "@/lib/checkout";
import { allAreaNames } from "@/lib/finder/areas";
import { formatShortDate, todayInIndia } from "@/lib/finder/dates";
import { formatPrice } from "@/lib/format";
import { useProfile } from "@/lib/profile";
import { routes } from "@/lib/routes";
import type { Maker, PersonalisationOption, Product } from "@/lib/types";
import { ArrowRightIcon } from "@/components/ui/icons";

const noopSubscribe = () => () => {};

const fieldClass =
  "w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-[0.95rem] aria-[invalid=true]:border-berry focus:border-burgundy focus:outline-none";

type Errors = Record<string, string>;

/** Adding a gift to the cart needs a signed-in profile; signed-out visitors go to the login page first. */
export function RequestForm({ product, maker }: { product: Product; maker: Maker }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const profile = useProfile();
  const here = `${pathname}${params.size ? `?${params}` : ""}`;

  useEffect(() => {
    if (profile === null) router.replace(routes.loginThen(here));
  }, [profile, router, here]);

  if (!profile) return <div className="h-96 animate-pulse rounded-lg bg-linen/60" aria-label="Checking sign-in" />;
  return <PersonaliseFields product={product} maker={maker} />;
}

function PersonaliseFields({ product, maker }: { product: Product; maker: Maker }) {
  const router = useRouter();
  const params = useSearchParams();
  // "Today" differs between build time and the visitor's day, so read it on the client only
  const today = useSyncExternalStore(noopSubscribe, () => todayInIndia(), () => null);

  const [options, setOptions] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      product.personalisation.map((o) => [o.id, o.kind === "choice" && o.required ? o.choices[0].id : ""]),
    ),
  );
  const [errors, setErrors] = useState<Errors>({});
  const [adding, setAdding] = useState(false);

  // Price and timing follow the options actually chosen (same rules as the cart)
  const priced = today ? priceLine({ id: "preview", kind: "gift", productId: product.id, options, quantity: 1 }, today) : undefined;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found: Errors = {};
    for (const o of product.personalisation) {
      if (o.required && !options[o.id]?.trim()) found[o.id] = `“${o.label}” is required.`;
    }
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.getElementById(`field-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setAdding(true);
    const filled = Object.fromEntries(Object.entries(options).filter(([, v]) => v.trim()).map(([k, v]) => [k, v.trim()]));
    addGift(product.id, filled);
    // A date or area chosen in the Gift Finder pre-fills checkout
    const area = allAreaNames.find((a) => a === params.get("area"));
    rememberDeliveryHints({ deliverBy: params.get("date") ?? undefined, area });
    router.push(routes.cart);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-10">
      {product.personalisation.length > 0 ? (
        <fieldset>
          <legend className="font-serif text-2xl">Make it personal</legend>
          <p className="mt-1 text-sm text-muted">Only the options {maker.name} offers for this gift. All are optional unless marked.</p>
          <div className="mt-5 space-y-5">
            {product.personalisation.map((o) => (
              <OptionField
                key={o.id}
                option={o}
                value={options[o.id] ?? ""}
                error={errors[o.id]}
                onChange={(v) => setOptions((prev) => ({ ...prev, [o.id]: v }))}
              />
            ))}
          </div>
        </fieldset>
      ) : (
        <p className="text-muted">This gift comes as it is: no personalisation options.</p>
      )}

      <section aria-labelledby="summary-heading" className="rounded-[1.25rem] border border-linen bg-white/70 p-6">
        <h2 id="summary-heading" className="font-serif text-xl">Your gift</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt>{product.name}</dt>
            <dd>{formatPrice(product.price)}</dd>
          </div>
          {priced?.details.filter((d) => d.extraCost > 0).map((d) => (
            <div key={d.label} className="flex justify-between gap-4 text-muted">
              <dt>{d.label}</dt>
              <dd>+{formatPrice(d.extraCost)}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-4 border-t border-linen pt-2 text-base font-medium">
            <dt>Price</dt>
            <dd>{formatPrice(priced?.unitPrice ?? product.price)}</dd>
          </div>
        </dl>
        {priced && (
          <p className="mt-3 text-xs text-muted">
            Earliest arrival {formatShortDate(priced.earliest)} (sample lead times). You&apos;ll add the delivery address
            and date at checkout.
          </p>
        )}
        <button
          type="submit"
          disabled={adding}
          className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-burgundy px-6 text-sm font-medium text-white transition-colors hover:bg-burgundy-hover disabled:opacity-60 sm:w-auto"
        >
          {adding ? "Adding…" : "Add to cart"} <ArrowRightIcon width={16} height={16} />
        </button>
      </section>
    </form>
  );
}

function OptionField({ option, value, error, onChange }: {
  option: PersonalisationOption; value: string; error?: string; onChange: (v: string) => void;
}) {
  const counterId = useId();
  const cost = (n: number) => (n > 0 ? ` (+${formatPrice(n)})` : "");

  if (option.kind === "choice") {
    return (
      <fieldset>
        <legend className="mb-2 text-sm font-medium">{option.label}</legend>
        <div className="flex flex-wrap gap-2">
          {option.choices.map((c) => (
            <label key={c.id}
              className="cursor-pointer rounded-md border border-linen bg-white px-3 py-2 text-sm has-[:checked]:border-burgundy has-[:checked]:bg-blush has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-burgundy">
              <input type="radio" name={option.id} value={c.id} checked={value === c.id}
                onChange={() => onChange(c.id)} className="sr-only" id={value === c.id ? `field-${option.id}` : undefined} />
              {c.label}{cost(c.extraCost)}
            </label>
          ))}
        </div>
        {error && <p className="mt-1.5 text-xs font-medium text-berry" role="alert">{error}</p>}
      </fieldset>
    );
  }

  const Input = option.multiline ? "textarea" : "input";
  return (
    <div>
      <label htmlFor={`field-${option.id}`} className="mb-1.5 block text-sm font-medium">
        {option.label}
        {!option.required && <span className="font-normal text-muted"> (optional)</span>}
        {option.extraCost > 0 && <span className="font-normal text-burgundy">{cost(option.extraCost)}</span>}
      </label>
      <Input id={`field-${option.id}`} className={fieldClass} value={value} maxLength={option.maxLength}
        placeholder={option.placeholder} rows={option.multiline ? 3 : undefined}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value)}
        aria-invalid={Boolean(error)} aria-describedby={counterId} />
      <p id={counterId} className="mt-1.5 flex justify-between gap-4 text-xs text-muted">
        <span>
          {option.helpText}
          {option.processingDaysAdded ? ` Adds ${option.processingDaysAdded} working day${option.processingDaysAdded > 1 ? "s" : ""}.` : ""}
        </span>
        <span>{value.length}/{option.maxLength}</span>
      </p>
      {error && <p className="mt-1 text-xs font-medium text-berry" role="alert">{error}</p>}
    </div>
  );
}
