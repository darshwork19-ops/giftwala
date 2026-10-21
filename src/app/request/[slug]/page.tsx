import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getAllProducts, getMaker, getProductBySlug } from "@/lib/catalogue";
import { formatPrice, formatProcessing } from "@/lib/format";
import { routes } from "@/lib/routes";
import { RequestForm } from "@/components/request/request-form";
import { GiftImage } from "@/components/ui/gift-image";

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/request/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  return { title: product ? `Request ${product.name}` : "Gift not found" };
}

export default function RequestPage({ params }: PageProps<"/request/[slug]">) {
  return (
    <Suspense fallback={<div className="page-container h-96 animate-pulse py-14" />}>
      <RequestContent params={params} />
    </Suspense>
  );
}

async function RequestContent({ params }: Pick<PageProps<"/request/[slug]">, "params">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  const maker = getMaker(product.makerId);

  return (
    <div className="page-container py-10 sm:py-14">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href={routes.product(product.slug)} className="hover:text-burgundy">
          ← Back to {product.name}
        </Link>
      </nav>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-14">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-linen">
            <GiftImage src={product.images[0].src} alt={product.images[0].alt} sizes="(min-width: 1024px) 30vw, 100vw" />
          </div>
          <p className="mt-4 text-xs tracking-wide text-muted uppercase">
            {maker.name} · {maker.location}
          </p>
          <h1 className="mt-1 font-serif text-3xl leading-tight">{product.name}</h1>
          <p className="mt-2 font-semibold">{formatPrice(product.price)}</p>
          <p className="mt-2 text-sm text-muted">{formatProcessing(product.processingDays)} by the maker.</p>
        </aside>
        <div>
          <p className="eyebrow mb-3">Order request</p>
          <p className="mb-8 max-w-xl text-muted">
            Fill this in once and we&apos;ll turn it into a clear order message for {maker.name}. You send it, they
            confirm. {maker.name} is a sample maker for this demo.
          </p>
          <Suspense>
            <RequestForm product={product} maker={maker} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
