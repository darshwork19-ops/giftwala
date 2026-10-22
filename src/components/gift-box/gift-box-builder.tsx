"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { categories } from "@/data/taxonomy";
import { getAllProducts, getMaker } from "@/lib/catalogue";
import { zoneLabels } from "@/lib/finder/areas";
import { formatShortDate, todayInIndia } from "@/lib/finder/dates";
import { formatPrice } from "@/lib/format";
import { BOX_MAX, BOX_MIN, summariseBox } from "@/lib/gift-box";
import { addBox } from "@/lib/cart";
import { useProfile } from "@/lib/profile";
import { routes } from "@/lib/routes";
import type { CategoryId } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { GiftImage } from "@/components/ui/gift-image";

const noopSubscribe = () => () => {};

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
  const [message, setMessage] = useState("");

  const all = getAllProducts();
  const chosen = selected.map((id) => all.find((p) => p.id === id)!).filter(Boolean);
  const summary = summariseBox(chosen, today ?? "2000-01-01");
  const shown = category === "all" ? all : all.filter((p) => p.category === category);

  const toggle = (id: string) => {
    // Adding the first gift needs a signed-in profile
    if (profile === null && !selected.includes(id)) {
      router.push(routes.loginThen(`${routes.giftBox}?add=${encodeURIComponent(id)}`));
      return;
    }
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= BOX_MAX ? prev : [...prev, id]));
  };

  const addToCart = () => {
    addBox(selected, message.trim() || undefined);
    router.push(routes.cart);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[2fr_1fr] lg:gap-12">
      <div>
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
          {chosen.length > 0 && (
            <div className="mt-4">
              <label htmlFor="box-message" className="mb-1.5 block text-sm font-medium">Gift message (optional)</label>
              <textarea id="box-message" rows={2} maxLength={200} value={message} onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl border border-charcoal/15 bg-white px-3 py-2 text-sm focus:border-burgundy focus:outline-none" />
              <p className="mt-1 text-right text-xs text-muted">{message.length}/200</p>
            </div>
          )}
          <Button className="mt-4 w-full rounded-full" disabled={Boolean(summary.problem)} onClick={addToCart}>
            Add box to cart
          </Button>
          <p className="mt-3 text-xs text-muted">
            GIFTWALA packs the items together. You&apos;ll add the delivery address and date at checkout; makers and products are sample data.
          </p>
        </div>
      </aside>
    </div>
  );
}
