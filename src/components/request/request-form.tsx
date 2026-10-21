"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useId, useState, useSyncExternalStore, type FormEvent } from "react";
import { allAreaNames, findArea, zoneLabels } from "@/lib/finder/areas";
import { addDays, addWorkingDays, formatShortDate, todayInIndia } from "@/lib/finder/dates";
import { formatPrice } from "@/lib/format";
import { newReference, saveOrderRequest, type OrderRequest } from "@/lib/order-requests";
import { routes } from "@/lib/routes";
import type { Maker, PersonalisationOption, Product } from "@/lib/types";
import { Button } from "@/components/ui/button";

const noopSubscribe = () => () => {};
const PHONE = /^(\+?91)?[6-9]\d{9}$/;

const fieldClass =
  "w-full rounded-md border border-linen bg-white px-3 py-2.5 text-sm aria-[invalid=true]:border-berry focus:border-burgundy";

type Errors = Record<string, string>;
type Chosen = { option: PersonalisationOption; value: string; extraCost: number };

export function RequestForm({ product, maker }: { product: Product; maker: Maker }) {
  const router = useRouter();
  const params = useSearchParams();
  // "Today" differs between build time and the visitor's day, so read it on the client only
  const today = useSyncExternalStore(noopSubscribe, () => todayInIndia(), () => null);

  const [options, setOptions] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      product.personalisation.map((o) => [o.id, o.kind === "choice" && o.required ? o.choices[0].id : ""]),
    ),
  );
  const [details, setDetails] = useState({
    recipientName: "",
    address: "",
    area: allAreaNames.find((a) => a === params.get("area")) ?? "",
    deliverBy: params.get("date") ?? "",
    buyerName: "",
    buyerPhone: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  // Price and timing follow the options actually chosen
  const chosen = product.personalisation.flatMap((o): Chosen[] => {
    const value = options[o.id]?.trim();
    if (!value) return [];
    if (o.kind === "choice") {
      const choice = o.choices.find((c) => c.id === value);
      return choice ? [{ option: o, value: choice.label, extraCost: choice.extraCost }] : [];
    }
    return [{ option: o, value, extraCost: o.extraCost }];
  });
  const extras = chosen.reduce((sum, c) => sum + c.extraCost, 0);
  const total = product.price + extras;
  const extraDays = chosen.reduce((sum, c) => sum + (c.option.processingDaysAdded ?? 0), 0);
  const earliest = today
    ? addDays(addWorkingDays(today, product.processingDays.max + extraDays), maker.deliveryDays)
    : undefined;

  const set = (key: keyof typeof details) => (value: string) => setDetails((d) => ({ ...d, [key]: value }));

  function validate(): Errors {
    const e: Errors = {};
    for (const o of product.personalisation) {
      if (o.required && !options[o.id]?.trim()) e[o.id] = `“${o.label}” is required.`;
    }
    if (!details.recipientName.trim()) e.recipientName = "Add the recipient's name.";
    if (details.address.trim().length < 10) e.address = "Add the full delivery address.";
    const area = findArea(details.area);
    if (!area) e.area = "Choose the delivery area.";
    else if (!maker.deliveryZones.includes(area.zone))
      e.area = `${maker.name} doesn't deliver to ${zoneLabels[area.zone]}.`;
    if (!details.deliverBy) e.deliverBy = "Choose the date it should arrive by.";
    else if (earliest && details.deliverBy < earliest)
      e.deliverBy = `The earliest this can arrive is ${formatShortDate(earliest)}.`;
    if (!details.buyerName.trim()) e.buyerName = "Add your name.";
    if (!PHONE.test(details.buyerPhone.replace(/[\s-]/g, "")))
      e.buyerPhone = "Add a 10-digit Indian mobile number.";
    return e;
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.getElementById(`field-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setSubmitting(true);
    const now = new Date().toISOString();
    const request: OrderRequest = {
      ref: newReference(),
      createdAt: now,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      makerName: maker.name,
      basePrice: product.price,
      personalisation: chosen.map((c) => ({ label: c.option.label, value: c.value, extraCost: c.extraCost })),
      total,
      deliverBy: details.deliverBy,
      area: details.area,
      recipientName: details.recipientName.trim(),
      address: details.address.trim(),
      buyerName: details.buyerName.trim(),
      buyerPhone: details.buyerPhone.trim(),
      status: "ready",
      history: [{ status: "ready", at: now }],
    };
    saveOrderRequest(request);
    // Optional hand-off to an order workflow (n8n); a no-op unless configured
    fetch("/api/order-request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request),
      keepalive: true,
    }).catch(() => {});
    router.push(routes.requestStatus(request.ref));
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-10">
      {product.personalisation.length > 0 && (
        <fieldset>
          <legend className="font-serif text-2xl">Make it personal</legend>
          <p className="mt-1 text-sm text-muted">Only the options {maker.name} offers for this gift.</p>
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
      )}

      <fieldset>
        <legend className="font-serif text-2xl">Delivery</legend>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field id="recipientName" label="Recipient's name" error={errors.recipientName}>
            <input id="field-recipientName" className={fieldClass} value={details.recipientName}
              onChange={(e) => set("recipientName")(e.target.value)} autoComplete="off"
              aria-invalid={Boolean(errors.recipientName)} aria-describedby="err-recipientName" />
          </Field>
          <Field id="deliverBy" label="Arrive by" error={errors.deliverBy}
            hint={earliest ? `Earliest possible: ${formatShortDate(earliest)}${extraDays ? ` (includes ${extraDays} day${extraDays > 1 ? "s" : ""} for personalisation)` : ""}` : undefined}>
            <input id="field-deliverBy" type="date" className={fieldClass} value={details.deliverBy}
              min={earliest} onChange={(e) => set("deliverBy")(e.target.value)}
              aria-invalid={Boolean(errors.deliverBy)} aria-describedby="err-deliverBy hint-deliverBy" />
          </Field>
          <Field id="address" label="Delivery address" error={errors.address} className="sm:col-span-2">
            <textarea id="field-address" rows={2} className={fieldClass} value={details.address}
              onChange={(e) => set("address")(e.target.value)} autoComplete="street-address"
              placeholder="Flat, building, street, landmark"
              aria-invalid={Boolean(errors.address)} aria-describedby="err-address" />
          </Field>
          <Field id="area" label="Area" error={errors.area}
            hint={`${maker.name} delivers to ${maker.deliveryZones.map((z) => zoneLabels[z]).join(", ")}.`}>
            <select id="field-area" className={fieldClass} value={details.area}
              onChange={(e) => set("area")(e.target.value)}
              aria-invalid={Boolean(errors.area)} aria-describedby="err-area hint-area">
              <option value="">Choose an area</option>
              {allAreaNames.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </Field>
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-serif text-2xl">Your details</legend>
        <p className="mt-1 text-sm text-muted">So the maker can confirm with you. Nothing else is needed.</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field id="buyerName" label="Your name" error={errors.buyerName}>
            <input id="field-buyerName" className={fieldClass} value={details.buyerName}
              onChange={(e) => set("buyerName")(e.target.value)} autoComplete="name"
              aria-invalid={Boolean(errors.buyerName)} aria-describedby="err-buyerName" />
          </Field>
          <Field id="buyerPhone" label="Your mobile number" error={errors.buyerPhone}>
            <input id="field-buyerPhone" type="tel" inputMode="tel" className={fieldClass} value={details.buyerPhone}
              onChange={(e) => set("buyerPhone")(e.target.value)} autoComplete="tel" placeholder="98765 43210"
              aria-invalid={Boolean(errors.buyerPhone)} aria-describedby="err-buyerPhone" />
          </Field>
        </div>
      </fieldset>

      <section aria-labelledby="summary-heading" className="rounded-lg border border-linen bg-white p-5">
        <h2 id="summary-heading" className="font-serif text-xl">Request summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt>{product.name}</dt>
            <dd>{formatPrice(product.price)}</dd>
          </div>
          {chosen.filter((c) => c.extraCost > 0).map((c) => (
            <div key={c.option.id} className="flex justify-between gap-4 text-muted">
              <dt>{c.option.label}</dt>
              <dd>+{formatPrice(c.extraCost)}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-4 border-t border-linen pt-2 text-base font-semibold">
            <dt>Total to pay the maker</dt>
            <dd>{formatPrice(total)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-muted">
          No payment is taken here. Sending a request asks {maker.name} to confirm; you agree payment with them
          directly. {product.returnPolicy === "non-returnable-perishable"
            ? "This gift is perishable and can't be returned unless it arrives damaged."
            : chosen.some((c) => c.option.id !== "gift-message" && c.option.id !== "packaging")
              ? "Personalised items can't be returned unless they arrive damaged."
              : "Returnable if unused, as agreed with the maker."}
        </p>
        <Button type="submit" size="lg" className="mt-5 w-full sm:w-auto" disabled={submitting}>
          {submitting ? "Preparing your request…" : "Prepare order request"}
        </Button>
      </section>
    </form>
  );
}

function Field({ id, label, hint, error, className = "", children }: {
  id: string; label: string; hint?: string; error?: string; className?: string; children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={`field-${id}`} className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
      {hint && <p id={`hint-${id}`} className="mt-1.5 text-xs text-muted">{hint}</p>}
      <p id={`err-${id}`} className="mt-1.5 text-xs font-medium text-berry" role={error ? "alert" : undefined}>
        {error}
      </p>
    </div>
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
