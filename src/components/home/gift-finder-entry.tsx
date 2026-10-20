import Form from "next/form";
import { occasions, recipients } from "@/data/taxonomy";
import { routes } from "@/lib/routes";
import { ArrowRightIcon, ChevronDownIcon } from "@/components/ui/icons";

const selectClass =
  "h-11 w-full appearance-none rounded-md border border-linen bg-white pr-9 pl-3 text-sm focus:border-burgundy";

/**
 * Compact first step of the Gift Finder. Submits recipient and occasion as
 * query parameters so the full finder can pick up where this left off.
 */
export function GiftFinderEntry() {
  return (
    <Form
      action={routes.giftFinder}
      className="rounded-lg border border-linen bg-white p-5 shadow-soft sm:p-6"
      aria-labelledby="finder-entry-title"
    >
      <p id="finder-entry-title" className="font-serif text-lg">
        Not sure where to start?
      </p>
      <p className="mt-1 text-sm text-muted">
        Tell us two things and we&apos;ll suggest a few ideas.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label htmlFor="finder-recipient" className="mb-1.5 block text-xs font-medium">
            Who is it for?
          </label>
          <div className="relative">
            <select id="finder-recipient" name="recipient" className={selectClass} defaultValue="">
              <option value="">Anyone</option>
              {recipients.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              width={16}
              height={16}
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted"
            />
          </div>
        </div>
        <div>
          <label htmlFor="finder-occasion" className="mb-1.5 block text-xs font-medium">
            What&apos;s the occasion?
          </label>
          <div className="relative">
            <select id="finder-occasion" name="occasion" className={selectClass} defaultValue="">
              <option value="">Any occasion</option>
              {occasions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              width={16}
              height={16}
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted"
            />
          </div>
        </div>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-charcoal px-5 text-sm font-medium text-white transition-colors hover:bg-burgundy"
        >
          Show ideas
          <ArrowRightIcon width={16} height={16} />
        </button>
      </div>
    </Form>
  );
}
