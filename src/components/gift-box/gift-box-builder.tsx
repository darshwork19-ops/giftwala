"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useSyncExternalStore, type FormEvent } from "react";
import { categories } from "@/data/taxonomy";
import { getAllProducts, getMaker } from "@/lib/catalogue";
import { allAreaNames, findArea, zoneLabels } from "@/lib/finder/areas";
import { formatShortDate, todayInIndia } from "@/lib/finder/dates";
import { formatPrice } from "@/lib/format";
import { BOX_MAX, BOX_MIN, summariseBox } from "@/lib/gift-box";
import { newReference, saveOrderRequest, type OrderRequest } from "@/lib/order-requests";
import { useProfile } from "@/lib/profile";
import { routes } from "@/lib/routes";
import type { CategoryId } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { GiftImage } from "@/components/ui/gift-image";

const noopSubscribe = () => () => {};
const PHONE = /^(\+?91)?[6-9]\d{9}$/;
const fieldClass =
  "w-full rounded-md border border-linen bg-white px-3 py-2.5 text-sm aria-[invalid=true]:border-berry focus:border-burgundy";

export function GiftBoxBuilder() {
  // A gift added before signing in comes back as ?add=<id>. Keyed so the box
  // restarts with it even when Next.js restores this page's previous state.
  const add = useSearchParams().get("add");
  const initial = add && getAllProducts().some((p) => p.id === add) ? [add] : [];
  return <Builder key={add ?? ""} initial={initial} />;
}

function Builder({ initial }: { initial: string[] }) {
  const router = useRouter();
  const profile = useProfile();
  // "Today" differs between build time and the visitor's day, so read it on the client only
  const today = useSyncExternalStore(noopSubscribe, () => todayInIndia(), () => null);
  const [selected, setSelected] = useState<string[]>(initial);
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [step, setStep] = useState<"choose" | "details">("choose");
  const [details, setDetails] = useState({ recipientName: "", address: "", area: "", deliverBy: "", message: "", buyerName: "", buyerPhone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const all = getAllProducts();
  const chosen = selected.map((id) => all.find((p) => p.id === id)!).filter(Boolean);
  const summary = summariseBox(chosen, today ?? "2000-01-01");
  const shown = category === "all" ? all : all.filter((p) => p.category === category);
  const set = (key: keyof typeof details) => (value: string) => setDetails((d) => ({ ...d, [key]: value }));

  const toggle = (id: string) => {
    // Adding the first gift needs a signed-in profile
    if (profile === null && !selected.includes(id)) {
      router.push(routes.loginThen(`${routes.giftBox}?add=${encodeURIComponent(id)}`));
      return;
    }
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= BOX_MAX ? prev : [...prev, id]));
  };

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const e: Record<string, string> = {};
    if (!details.recipientName.trim()) e.recipientName = "Add the recipient's name.";
    if (details.address.trim().length < 10) e.address = "Add the full delivery address.";
    const area = findArea(details.area);
    if (!area) e.area = "Choose the delivery area.";
    else if (!summary.zones.includes(area.zone)) e.area = `Not every maker in this box delivers to ${zoneLabels[area.zone]}.`;
    if (!details.deliverBy) e.deliverBy = "Choose the date it should arrive by.";
    else if (summary.earliest && details.deliverBy < summary.earliest)
      e.deliverBy = `The earliest this box can arrive is ${formatShortDate(summary.earliest)}.`;
    if (!details.buyerName.trim()) e.buyerName = "Add your name.";
    if (!PHONE.test(details.buyerPhone.replace(/[\s-]/g, ""))) e.buyerPhone = "Add a 10-digit Indian mobile number.";
    setErrors(e);
    if (Object.keys(e).length) {
      document.getElementById(`box-${Object.keys(e)[0]}`)?.focus();
      return;
    }
    const now = new Date().toISOString();
    const request: OrderRequest = {
      ref: newReference(),
      createdAt: now,
      productId: "gift-box",
      productSlug: "",
      productName: `Gift box of ${chosen.length}`,
      makerName: "GIFTWALA (packed from sample makers)",
      basePrice: summary.subtotal,
      personalisation: details.message.trim() ? [{ label: "Gift message", value: details.message.trim(), extraCost: 0 }] : [],
      items: chosen.map((p) => ({ name: p.name, maker: getMaker(p.makerId).name, price: p.price })),
      total: summary.subtotal,
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

  const areaOptions = allAreaNames.filter((a) => {
    const match = findArea(a);
    return match && summary.zones.includes(match.zone);
  });

  return (
    <div className="grid gap-10 lg:grid-cols-[2fr_1fr] lg:gap-12">
      <div>
        {step === "choose" ? (
          <>
            <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
              {[{ id: "all" as const, label: "All gifts" }, ...categories].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={category === c.id}
                  onClick={() => setCategory(c.id)}
                  className="rounded-full border border-linen bg-white px-3 py-1.5 text-sm aria-pressed:border-burgundy aria-pressed:bg-blush aria-pressed:text-burgundy"
                >
                  {c.label}
                </button>
              ))}
            </div>
            <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3">
              {shown.map((p) => {
                const inBox = selected.includes(p.id);
                const full = !inBox && selected.length >= BOX_MAX;
                return (
                  <li key={p.id} className={`rounded-md border bg-white p-2 ${inBox ? "border-burgundy" : "border-linen"}`}>
                    <div className="relative aspect-square overflow-hidden rounded bg-linen">
                      <GiftImage src={p.images[0].src} alt={p.images[0].alt} sizes="(min-width: 640px) 20vw, 45vw" />
                    </div>
                    <p className="mt-2 text-xs text-muted">{getMaker(p.makerId).name}</p>
                    <p className="text-sm leading-snug font-medium">{p.name}</p>
                    <p className="mt-1 text-sm font-semibold">{formatPrice(p.price)}</p>
                    <button
                      type="button"
                      aria-pressed={inBox}
                      disabled={full}
                      onClick={() => toggle(p.id)}
                      className="mt-2 w-full rounded-md border border-charcoal/20 py-1.5 text-sm font-medium aria-pressed:border-burgundy aria-pressed:bg-burgundy aria-pressed:text-white disabled:opacity-50"
                    >
                      {inBox ? "✓ In your box" : full ? "Box is full" : "Add to box"}
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <form onSubmit={onSubmit} noValidate className="space-y-5">
            <button type="button" onClick={() => setStep("choose")} className="text-sm text-muted hover:text-burgundy">
              ← Change gifts
            </button>
            <h2 className="font-serif text-2xl">Where should the box go?</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <BoxField id="recipientName" label="Recipient's name" error={errors.recipientName}>
                <input id="box-recipientName" className={fieldClass} value={details.recipientName} onChange={(e) => set("recipientName")(e.target.value)} aria-invalid={Boolean(errors.recipientName)} />
              </BoxField>
              <BoxField id="deliverBy" label="Arrive by" error={errors.deliverBy} hint={summary.earliest ? `Earliest possible: ${formatShortDate(summary.earliest)}` : undefined}>
                <input id="box-deliverBy" type="date" min={summary.earliest} className={fieldClass} value={details.deliverBy} onChange={(e) => set("deliverBy")(e.target.value)} aria-invalid={Boolean(errors.deliverBy)} />
              </BoxField>
              <BoxField id="address" label="Delivery address" error={errors.address} className="sm:col-span-2">
                <textarea id="box-address" rows={2} className={fieldClass} value={details.address} onChange={(e) => set("address")(e.target.value)} placeholder="Flat, building, street, landmark" aria-invalid={Boolean(errors.address)} />
              </BoxField>
              <BoxField id="area" label="Area" error={errors.area} hint={`Every maker in this box delivers to: ${summary.zones.map((z) => zoneLabels[z]).join(", ")}.`}>
                <select id="box-area" className={fieldClass} value={details.area} onChange={(e) => set("area")(e.target.value)} aria-invalid={Boolean(errors.area)}>
                  <option value="">Choose an area</option>
                  {areaOptions.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </BoxField>
              <BoxField id="message" label="Gift message (optional)" className="sm:col-span-2" hint={`${details.message.length}/200`}>
                <textarea id="box-message" rows={2} maxLength={200} className={fieldClass} value={details.message} onChange={(e) => set("message")(e.target.value)} />
              </BoxField>
              <BoxField id="buyerName" label="Your name" error={errors.buyerName}>
                <input id="box-buyerName" className={fieldClass} value={details.buyerName} onChange={(e) => set("buyerName")(e.target.value)} autoComplete="name" aria-invalid={Boolean(errors.buyerName)} />
              </BoxField>
              <BoxField id="buyerPhone" label="Your mobile number" error={errors.buyerPhone}>
                <input id="box-buyerPhone" type="tel" className={fieldClass} value={details.buyerPhone} onChange={(e) => set("buyerPhone")(e.target.value)} autoComplete="tel" placeholder="98765 43210" aria-invalid={Boolean(errors.buyerPhone)} />
              </BoxField>
            </div>
            <Button type="submit" size="lg">Prepare box request</Button>
          </form>
        )}
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-lg border border-linen bg-white p-5" aria-live="polite">
          <h2 className="font-serif text-xl">Your box</h2>
          <p className="mt-1 text-xs text-muted">
            {summary.count} of {BOX_MAX} gifts · choose at least {BOX_MIN}
          </p>
          {chosen.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Add gifts from the list to start a box.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {chosen.map((p) => (
                <li key={p.id} className="flex items-start justify-between gap-3">
                  <span>{p.name}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    {formatPrice(p.price)}
                    <button type="button" onClick={() => toggle(p.id)} className="text-xs text-muted underline hover:text-burgundy" aria-label={`Remove ${p.name}`}>
                      Remove
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex justify-between border-t border-linen pt-3 font-semibold">
            <span>Total</span>
            <span>{formatPrice(summary.subtotal)}</span>
          </div>
          {chosen.length > 0 && today && (
            <dl className="mt-3 space-y-1 text-xs text-muted">
              <div>
                <dt className="inline">Delivers to: </dt>
                <dd className="inline">{summary.zones.length ? summary.zones.map((z) => zoneLabels[z]).join(", ") : "no area every maker covers"}</dd>
              </div>
              {summary.earliest && (
                <div>
                  <dt className="inline">Earliest arrival: </dt>
                  <dd className="inline">{formatShortDate(summary.earliest)} (sample lead times + 1 day to pack)</dd>
                </div>
              )}
              {summary.perishable && <p>Contains fresh or food items, which can&apos;t be returned.</p>}
            </dl>
          )}
          {summary.problem && chosen.length > 0 && (
            <p className="mt-3 text-xs font-medium text-berry" role="status">{summary.problem}</p>
          )}
          {step === "choose" && (
            <Button className="mt-5 w-full" disabled={Boolean(summary.problem)} onClick={() => {
                // Your name and number come from your profile; both stay editable
                if (profile) setDetails((d) => ({ ...d, buyerName: d.buyerName || profile.name, buyerPhone: d.buyerPhone || profile.phone }));
                setStep("details");
              }}>
              Continue to delivery
            </Button>
          )}
          <p className="mt-3 text-xs text-muted">
            Demo: no payment is taken. GIFTWALA would pack the items together; makers and products are sample data.
          </p>
        </div>
      </aside>
    </div>
  );
}

function BoxField({ id, label, hint, error, className = "", children }: {
  id: string; label: string; hint?: string; error?: string; className?: string; children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={`box-${id}`} className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1.5 text-xs font-medium text-berry" role="alert">{error}</p>}
    </div>
  );
}
