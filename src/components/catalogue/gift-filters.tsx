"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { categories, occasions, recipients } from "@/data/taxonomy";
import { routes } from "@/lib/routes";
import type { GiftFilters, SortId } from "@/lib/search";
import { SearchIcon } from "@/components/ui/icons";

interface GiftFiltersFormProps {
  filters: GiftFilters;
  sort: SortId;
  sortOptions: { id: SortId; label: string }[];
}

const field =
  "h-11 w-full rounded-md border border-linen bg-white px-3 text-sm text-charcoal focus:border-burgundy";
const labelClass = "mb-1.5 block text-sm font-medium";

/**
 * Search, filter and sort controls for /gifts. Works as a plain GET form
 * without JavaScript; with JavaScript it drops empty fields from the URL and
 * applies select/checkbox changes straight away.
 */
export function GiftFiltersForm({ filters, sort, sortOptions }: GiftFiltersFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const apply = (form: HTMLFormElement) => {
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(form)) {
      const v = String(value).trim();
      if (v) params.set(key, v);
    }
    // "Featured"/"Best match" are defaults, so keep them out of the URL.
    if (params.get("sort") === "featured" || params.get("sort") === "relevance") {
      if (!params.get("q") || params.get("sort") === "relevance") params.delete("sort");
    }
    const qs = params.toString();
    router.push(qs ? `${routes.gifts}?${qs}` : routes.gifts, { scroll: false });
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    apply(e.currentTarget);
  };

  // Selects and checkboxes apply immediately; text and number fields wait
  // for Enter or the Apply button.
  const onChange = (e: FormEvent<HTMLFormElement>) => {
    const target = e.target as HTMLElement;
    if (target instanceof HTMLSelectElement || (target as HTMLInputElement).type === "checkbox") {
      apply(e.currentTarget);
    }
  };

  return (
    <form
      action={routes.gifts}
      method="get"
      role="search"
      aria-label="Search and filter gifts"
      onSubmit={onSubmit}
      onChange={onChange}
    >
      <label htmlFor="gifts-q" className={labelClass}>
        Search
      </label>
      <div className="flex gap-2">
        <input
          id="gifts-q"
          name="q"
          type="search"
          defaultValue={filters.q ?? ""}
          maxLength={100}
          placeholder="e.g. candle for a friend under ₹1500"
          className={`${field} min-w-0 flex-1 placeholder:text-muted/80`}
        />
        <button
          type="submit"
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-md bg-burgundy px-4 text-white hover:bg-burgundy-hover"
        >
          <SearchIcon />
          <span className="sr-only">Search</span>
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 lg:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="inline-flex h-11 items-center rounded-md border border-charcoal/25 px-4 text-sm font-medium hover:border-burgundy hover:text-burgundy"
        >
          {open ? "Hide filters" : "Show filters"}
        </button>
      </div>

      <div id={panelId} className={`${open ? "block" : "hidden"} mt-6 space-y-5 lg:block`}>
        <div>
          <label htmlFor="gifts-sort" className={labelClass}>
            Sort by
          </label>
          <select id="gifts-sort" name="sort" defaultValue={sort} className={field}>
            {sortOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="gifts-occasion" className={labelClass}>
            Occasion
          </label>
          <select id="gifts-occasion" name="occasion" defaultValue={filters.occasion ?? ""} className={field}>
            <option value="">Any occasion</option>
            {occasions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="gifts-category" className={labelClass}>
            Category
          </label>
          <select id="gifts-category" name="category" defaultValue={filters.category ?? ""} className={field}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="gifts-recipient" className={labelClass}>
            Who it&apos;s for
          </label>
          <select id="gifts-recipient" name="recipient" defaultValue={filters.recipient ?? ""} className={field}>
            <option value="">Anyone</option>
            {recipients.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className={labelClass}>Price (₹)</legend>
          <div className="flex items-center gap-2">
            <label htmlFor="gifts-min" className="sr-only">
              Minimum price in rupees
            </label>
            <input
              id="gifts-min"
              name="min"
              type="number"
              inputMode="numeric"
              min={0}
              step={50}
              placeholder="Min"
              defaultValue={filters.min ?? ""}
              className={field}
            />
            <span aria-hidden="true" className="text-muted">
              –
            </span>
            <label htmlFor="gifts-max" className="sr-only">
              Maximum price in rupees
            </label>
            <input
              id="gifts-max"
              name="max"
              type="number"
              inputMode="numeric"
              min={0}
              step={50}
              placeholder="Max"
              defaultValue={filters.max ?? ""}
              className={field}
            />
          </div>
        </fieldset>

        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            name="personalised"
            value="1"
            defaultChecked={!!filters.personalised}
            className="h-5 w-5 accent-burgundy"
          />
          Personalisable only
        </label>

        <button
          type="submit"
          className="inline-flex h-11 w-full items-center justify-center rounded-md border border-charcoal/25 text-sm font-medium hover:border-burgundy hover:text-burgundy"
        >
          Apply filters
        </button>
      </div>
    </form>
  );
}
