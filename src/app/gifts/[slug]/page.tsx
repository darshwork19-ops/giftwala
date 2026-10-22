import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { categoryLabel, occasions } from "@/data/taxonomy";
import {
  getAllProducts,
  getMaker,
  getProductBySlug,
  getProductsByMaker,
  isPersonalisable,
} from "@/lib/catalogue";
import { zoneLabels } from "@/lib/finder/areas";
import { formatPrice, formatProcessing } from "@/lib/format";
import { routes } from "@/lib/routes";
import { giftsHref } from "@/lib/search";
import type { PersonalisationOption, Product, StockStatus } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";
import { ButtonLink } from "@/components/ui/button";
import { GiftImage } from "@/components/ui/gift-image";
import { ClockIcon, PenIcon, ReceiptIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/gifts/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Gift not found" };
  const maker = getMaker(product.makerId);
  return {
    title: product.name,
    description: `${product.summary} Handmade by ${maker.name}, ${maker.location}. ${formatPrice(product.price)}.`,
    openGraph: {
      title: product.name,
      description: product.summary,
      images: [{ url: product.images[0].src, alt: product.images[0].alt }],
    },
  };
}

export default function ProductPage({ params }: PageProps<"/gifts/[slug]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetails params={params} />
    </Suspense>
  );
}

const STOCK: Record<StockStatus, { label: string; detail: string; className: string }> = {
  "in-stock": {
    label: "In stock",
    detail: "Ready for the maker to prepare.",
    className: "bg-sage/10 text-sage",
  },
  "low-stock": {
    label: "Only a few left",
    detail: "The maker has limited pieces of this one.",
    className: "bg-blush text-berry",
  },
  "made-to-order": {
    label: "Made to order",
    detail: "Made by hand once you order.",
    className: "bg-linen text-charcoal",
  },
};

async function ProductDetails({ params }: Pick<PageProps<"/gifts/[slug]">, "params">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const maker = getMaker(product.makerId);
  const stock = STOCK[product.stock];
  const moreFromMaker = getProductsByMaker(maker.id)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);
  const productOccasions = occasions.filter((o) => product.occasions.includes(o.id));

  return (
    <>
      <div className="page-container py-8 lg:py-12">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li>
              <Link href={routes.gifts} className="hover:text-burgundy">
                All gifts
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={giftsHref({ category: product.category })} className="hover:text-burgundy">
                {categoryLabel(product.category)}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-charcoal">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-4">
            {product.images.map((image, i) => (
              <div
                key={image.src}
                className="relative aspect-[4/5] overflow-hidden rounded-lg bg-linen"
              >
                <GiftImage
                  src={image.src}
                  alt={image.alt}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  preload={i === 0}
                />
              </div>
            ))}
            <p className="text-xs text-muted">
              Sample photography. The finished piece may differ slightly.
            </p>
          </div>

          <div>
            <Link
              href={routes.maker(maker.slug)}
              className="text-sm tracking-wide text-muted uppercase hover:text-burgundy"
            >
              {maker.name} · {maker.location}
            </Link>
            <h1 className="mt-2 font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-4 text-2xl font-semibold">{formatPrice(product.price)}</p>
            <p className="mt-4 text-lg text-muted">{product.summary}</p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${stock.className}`}>
                {stock.label}
              </span>
              <span className="text-sm text-muted">{stock.detail}</span>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href={routes.requestGift(product.slug)} size="lg">
                {product.personalisation.length > 0 ? "Personalise and add to cart" : "Add to cart"}
              </ButtonLink>
              <p className="text-sm text-muted">
                Delivers to {maker.deliveryZones.map((z) => zoneLabels[z]).join(", ")}.
              </p>
            </div>

            <dl className="mt-8 space-y-4 border-y border-linen py-6 text-sm">
              <div className="flex gap-3">
                <ClockIcon className="mt-0.5 shrink-0 text-burgundy" />
                <div>
                  <dt className="font-medium">Processing time</dt>
                  <dd className="text-muted">
                    {formatProcessing(product.processingDays)} by the maker.
                    {product.personalisation.some((o) => o.processingDaysAdded) &&
                      " Some personalisation adds a little extra time (shown below)."}
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <ReceiptIcon className="mt-0.5 shrink-0 text-burgundy" />
                <div>
                  <dt className="font-medium">Returns</dt>
                  <dd className="text-muted">{returnPolicyText(product)}</dd>
                </div>
              </div>
            </dl>

            <section aria-labelledby="about-heading" className="mt-8">
              <h2 id="about-heading" className="font-serif text-2xl">
                About this gift
              </h2>
              <p className="mt-3">{product.description}</p>
              {product.materials && product.materials.length > 0 && (
                <>
                  <h3 className="mt-6 text-sm font-semibold">Materials</h3>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {product.materials.map((m) => (
                      <li key={m} className="rounded-full bg-linen px-3 py-1 text-sm">
                        {m}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {productOccasions.length > 0 && (
                <>
                  <h3 className="mt-6 text-sm font-semibold">Good for</h3>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {productOccasions.map((o) => (
                      <li key={o.id}>
                        <Link
                          href={routes.giftsForOccasion(o.id)}
                          className="inline-block rounded-full border border-linen bg-white px-3 py-1 text-sm hover:border-burgundy hover:text-burgundy"
                        >
                          {o.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>

            <section aria-labelledby="personalise-heading" className="mt-10">
              <h2 id="personalise-heading" className="flex items-center gap-2 font-serif text-2xl">
                <PenIcon className="text-burgundy" />
                {isPersonalisable(product) ? "Ways to personalise" : "Options"}
              </h2>
              {product.personalisation.length > 0 ? (
                <>
                  <ul className="mt-4 space-y-3">
                    {product.personalisation.map((option) => (
                      <PersonalisationSummary key={option.id} option={option} />
                    ))}
                  </ul>
                  <p className="mt-4 text-sm text-muted">
                    You&apos;ll choose these when you request the gift.
                  </p>
                </>
              ) : (
                <p className="mt-3 text-muted">
                  This gift comes as it is, with no personalisation options.
                </p>
              )}
            </section>

            <section
              aria-labelledby="maker-heading"
              className="mt-10 rounded-lg border border-linen bg-white p-6"
            >
              <p className="eyebrow mb-2">Made by</p>
              <h2 id="maker-heading" className="font-serif text-2xl">
                {maker.name}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {maker.craft} · {maker.location}
              </p>
              <p className="mt-3 text-sm">{maker.tagline}</p>
              <Link
                href={routes.maker(maker.slug)}
                className="mt-4 inline-block text-sm font-medium text-burgundy underline underline-offset-4 hover:text-burgundy-hover"
              >
                Meet {maker.name}
              </Link>
              <p className="mt-4 text-xs text-muted">Sample maker profile for this demo.</p>
            </section>
          </div>
        </div>
      </div>

      {moreFromMaker.length > 0 && (
        <section
          aria-labelledby="more-heading"
          className="page-container border-t border-linen py-14 lg:py-20"
        >
          <SectionHeading id="more-heading" title={`More from ${maker.name}`} />
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {moreFromMaker.map((p) => (
              <li key={p.id} className="flex">
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function returnPolicyText(product: Product): string {
  if (product.returnPolicy === "non-returnable-perishable") {
    return "This is a perishable gift, so it can't be returned. If it arrives damaged, let us know and we'll help put it right.";
  }
  if (isPersonalisable(product)) {
    return "Returnable if ordered without personalisation. Personalised items can't be returned unless they arrive damaged.";
  }
  return "Returnable if you change your mind. Items that arrive damaged are always covered.";
}

function PersonalisationSummary({ option }: { option: PersonalisationOption }) {
  const details: string[] = [];
  if (option.kind === "text") {
    details.push(`Up to ${option.maxLength} characters`);
    details.push(option.extraCost ? `+${formatPrice(option.extraCost)}` : "Free");
  }
  if (option.processingDaysAdded) {
    details.push(
      `adds ${option.processingDaysAdded} working day${option.processingDaysAdded === 1 ? "" : "s"}`,
    );
  }

  return (
    <li className="rounded-md border border-linen bg-white p-4">
      <p className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="font-medium">{option.label}</span>
        <span className="text-xs text-muted">{option.required ? "Required" : "Optional"}</span>
      </p>
      {option.helpText && <p className="mt-1 text-sm text-muted">{option.helpText}</p>}
      {details.length > 0 && <p className="mt-2 text-sm">{details.join(" · ")}</p>}
      {option.kind === "choice" && (
        <ul className="mt-2 space-y-1 text-sm">
          {option.choices.map((c) => (
            <li key={c.id} className="flex justify-between gap-3">
              <span>{c.label}</span>
              <span className="shrink-0 text-muted">
                {c.extraCost ? `+${formatPrice(c.extraCost)}` : "Included"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function ProductSkeleton() {
  return (
    <div className="page-container py-8 lg:py-12" aria-busy="true" aria-label="Loading gift">
      <div className="mb-6 h-4 w-48 animate-pulse rounded bg-linen" />
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="aspect-[4/5] animate-pulse rounded-lg bg-linen/70" />
        <div className="space-y-4">
          <div className="h-4 w-40 animate-pulse rounded bg-linen" />
          <div className="h-12 w-3/4 animate-pulse rounded bg-linen" />
          <div className="h-8 w-24 animate-pulse rounded bg-linen" />
          <div className="h-24 animate-pulse rounded bg-linen/70" />
        </div>
      </div>
    </div>
  );
}
