import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { categoryLabel, occasions, recipients } from "@/data/taxonomy";
import { getAllProducts } from "@/lib/catalogue";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import {
  giftsHref,
  hasActiveFilters,
  parseSearchParams,
  priceLabel,
  pricePresets,
  searchGifts,
  sortOptions,
  type GiftFilters,
} from "@/lib/search";
import { GiftFiltersForm } from "@/components/catalogue/gift-filters";
import { ProductCard } from "@/components/product/product-card";
import { ShopProductCard } from "@/components/shop/shop-product-card";
import { MakerProductCard } from "@/components/studio/maker-product-card";
import { externalProducts } from "@/data/external-products";
import { studioShowcase } from "@/lib/studios";
import { ButtonLink } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "All gifts",
  description:
    "Browse handmade gifts from independent makers. Search by name or idea, and filter by occasion, category, budget and personalisation.",
};

export default function GiftsPage({ searchParams }: PageProps<"/gifts">) {
  return (
    <div className="page-container py-10 lg:py-14">
      <p className="eyebrow mb-3">Discover</p>
      <Suspense fallback={<CatalogueSkeleton />}>
        <Catalogue searchParams={searchParams} />
      </Suspense>
      <MoreToExplore />
    </div>
  );
}

/** Real products from Mumbai Instagram makers and The Drunken Mug, beyond the demo catalogue. */
function MoreToExplore() {
  const makerPicks = studioShowcase(8);
  const shopPicks = externalProducts.filter((p) => p.shopId === "drunken-mug" && !p.adultsOnly).slice(0, 4);
  const link =
    "inline-flex items-center gap-1.5 text-sm font-medium text-charcoal underline decoration-linen underline-offset-4 hover:text-burgundy hover:decoration-burgundy";
  return (
    <>
      <section aria-labelledby="discover-makers" className="mt-20 border-t border-linen pt-14">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2 id="discover-makers" className="font-serif text-3xl tracking-tight sm:text-4xl">From Mumbai makers</h2>
            <p className="mt-3 text-sm text-muted">
              Real studios that sell on Instagram. No listed prices: message them to order.
            </p>
          </div>
          <Link href={routes.makers} className={link}>All Mumbai makers →</Link>
        </div>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {makerPicks.map((p) => (
            <li key={p.id}>
              <MakerProductCard product={p} maker={p.maker} showPhoto showMaker />
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="discover-tdm" className="mt-20 border-t border-linen pt-14">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2 id="discover-tdm" className="font-serif text-3xl tracking-tight sm:text-4xl">From The Drunken Mug</h2>
            <p className="mt-3 text-sm text-muted">Upcycled bottle glassware, sold on their own site.</p>
          </div>
          <div className="flex gap-5">
            <Link href={routes.drunkenMug} className={link}>See the whole shop →</Link>
            <Link href={routes.shops} className={link}>Small Indian brands →</Link>
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {shopPicks.map((p) => (
            <li key={p.id}>
              <ShopProductCard product={p} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

async function Catalogue({ searchParams }: Pick<PageProps<"/gifts">, "searchParams">) {
  const filters = parseSearchParams(await searchParams);
  const result = searchGifts(filters);
  const count = result.products.length;

  return (
    <>
      <h1 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
        {pageTitle(filters)}
      </h1>
      <p className="mt-3 max-w-2xl text-muted sm:text-lg">
        Handmade gifts from independent makers. Search for an idea, or narrow
        things down by occasion, budget and who it&apos;s for.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[17rem_1fr] lg:gap-12">
        <aside aria-label="Search and filters" className="lg:sticky lg:top-28 lg:self-start">
          <GiftFiltersForm
            key={giftsHref(filters)}
            filters={filters}
            sort={result.sort}
            sortOptions={sortOptions}
          />
        </aside>

        <section aria-labelledby="results-heading">
          <div className="flex flex-col gap-4 border-b border-linen pb-4">
            <h2 id="results-heading" className="text-sm text-muted" aria-live="polite">
              <span className="font-semibold text-charcoal">{count}</span>{" "}
              {count === 1 ? "gift" : "gifts"}
              {filters.q && (
                <>
                  {" "}
                  for <span className="font-semibold text-charcoal">“{filters.q}”</span>
                </>
              )}
            </h2>
            {result.understood.length > 0 && (
              <p className="text-sm text-muted">
                We read your search as:{" "}
                <span className="text-charcoal">{result.understood.join(" · ")}</span>
              </p>
            )}
            {result.partialMatch && count > 0 && (
              <p className="text-sm text-muted">
                Nothing matched every word, so these gifts match some of them.
              </p>
            )}
            <ActiveFilters filters={filters} />
            <PricePresets filters={filters} />
          </div>

          {count > 0 ? (
            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:gap-x-6">
              {result.products.map((product, i) => (
                <li key={product.id} className="flex">
                  <ProductCard product={product} priority={i < 3} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState filters={filters} />
          )}
        </section>
      </div>
    </>
  );
}

function pageTitle(filters: GiftFilters) {
  const occasion = occasions.find((o) => o.id === filters.occasion);
  if (occasion && !filters.category)
    return occasion.id === "festivals" ? "Festive gifts" : `${occasion.label} gifts`;
  if (filters.category && !occasion) return categoryLabel(filters.category);
  if (filters.personalised && !occasion && !filters.category) return "Personalised gifts";
  return "All gifts";
}

/** One removable chip per active filter, plus "Clear all". */
function ActiveFilters({ filters }: { filters: GiftFilters }) {
  if (!hasActiveFilters(filters)) return null;

  const chips: { label: string; href: string }[] = [];
  const without = (patch: Partial<GiftFilters>) => giftsHref({ ...filters, ...patch });

  if (filters.q) chips.push({ label: `Search: “${filters.q}”`, href: without({ q: undefined }) });
  if (filters.occasion)
    chips.push({
      label: occasions.find((o) => o.id === filters.occasion)!.label,
      href: without({ occasion: undefined }),
    });
  if (filters.category)
    chips.push({ label: categoryLabel(filters.category), href: without({ category: undefined }) });
  if (filters.recipient)
    chips.push({
      label: `For: ${recipients.find((r) => r.id === filters.recipient)!.label}`,
      href: without({ recipient: undefined }),
    });
  if (filters.min !== undefined || filters.max !== undefined) {
    const label = priceLabel(filters.min, filters.max);
    chips.push({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      href: without({ min: undefined, max: undefined }),
    });
  }
  if (filters.personalised)
    chips.push({ label: "Personalisable", href: without({ personalised: undefined }) });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="sr-only">Active filters:</span>
      {chips.map((chip) => (
        <Link
          key={chip.label}
          href={chip.href}
          scroll={false}
          className="inline-flex items-center gap-1.5 rounded-full border border-linen bg-white py-1.5 pr-2.5 pl-3.5 text-sm hover:border-burgundy hover:text-burgundy"
        >
          {chip.label}
          <CloseIcon width={14} height={14} />
          <span className="sr-only">(remove filter)</span>
        </Link>
      ))}
      <Link
        href={
          filters.sort && filters.sort !== "relevance"
            ? giftsHref({ sort: filters.sort })
            : routes.gifts
        }
        scroll={false}
        className="ml-1 text-sm font-medium text-burgundy underline underline-offset-4 hover:text-burgundy-hover"
      >
        Remove all filters
      </Link>
    </div>
  );
}

function PricePresets({ filters }: { filters: GiftFilters }) {
  return (
    <nav aria-label="Quick budgets" className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-muted">Budget:</span>
      {pricePresets.map((preset) => {
        const active = filters.min === preset.min && filters.max === preset.max;
        return (
          <Link
            key={preset.label}
            href={giftsHref({ ...filters, min: preset.min, max: preset.max })}
            scroll={false}
            aria-current={active ? "true" : undefined}
            className="rounded-full border border-linen px-3 py-1 hover:border-burgundy hover:text-burgundy aria-[current=true]:border-burgundy aria-[current=true]:bg-blush aria-[current=true]:text-burgundy"
          >
            {preset.label}
          </Link>
        );
      })}
    </nav>
  );
}

function EmptyState({ filters }: { filters: GiftFilters }) {
  const lowestPrice = Math.min(...getAllProducts().map((p) => p.price));
  const hasPrice = filters.min !== undefined || filters.max !== undefined;
  return (
    <div className="mt-10 rounded-lg border border-linen bg-white p-8 text-center sm:p-12">
      <h3 className="font-serif text-2xl">No gifts match just yet</h3>
      <p className="mx-auto mt-3 max-w-md text-muted">
        Try fewer words, a wider budget or removing a filter.
        {filters.q && " Searching for a type of gift, like “candle” or “mug”, often works best."}
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        {hasPrice && (
          <ButtonLink href={giftsHref({ ...filters, min: undefined, max: undefined })} variant="secondary">
            Remove the budget
          </ButtonLink>
        )}
        <ButtonLink href={routes.gifts}>See all gifts</ButtonLink>
      </div>
      {filters.max !== undefined && filters.max < lowestPrice && (
        <p className="mt-6 text-sm text-muted">
          Our gifts currently start at {formatPrice(lowestPrice)}.
        </p>
      )}
    </div>
  );
}

function CatalogueSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading gifts">
      <div className="h-12 w-64 animate-pulse rounded-md bg-linen" />
      <div className="mt-10 grid gap-10 lg:grid-cols-[17rem_1fr] lg:gap-12">
        <div className="h-64 animate-pulse rounded-md bg-linen/70" />
        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:gap-x-6">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="aspect-[4/5] animate-pulse rounded-md bg-linen/70" />
          ))}
        </ul>
      </div>
    </div>
  );
}
