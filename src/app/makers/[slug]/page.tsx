import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getAllMakers, getMakerBySlug, getProductsByMaker } from "@/lib/catalogue";
import { routes } from "@/lib/routes";
import { ProductCard } from "@/components/product/product-card";
import { GiftImage } from "@/components/ui/gift-image";
import { SectionHeading } from "@/components/ui/section-heading";

export function generateStaticParams() {
  return getAllMakers().map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/makers/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const maker = getMakerBySlug(slug);
  if (!maker) return { title: "Maker not found" };
  return {
    title: `${maker.name} — ${maker.craft}`,
    description: `${maker.tagline} ${maker.craft} from ${maker.location}.`,
  };
}

export default function MakerPage({ params }: PageProps<"/makers/[slug]">) {
  return (
    <Suspense fallback={<MakerSkeleton />}>
      <MakerProfile params={params} />
    </Suspense>
  );
}

async function MakerProfile({ params }: Pick<PageProps<"/makers/[slug]">, "params">) {
  const { slug } = await params;
  const maker = getMakerBySlug(slug);
  if (!maker) notFound();
  const products = getProductsByMaker(maker.id);

  return (
    <>
      <div className="page-container py-8 lg:py-12">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href={routes.makers} className="hover:text-burgundy">
                Makers
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-charcoal">
              {maker.name}
            </li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-linen lg:col-span-6">
            <GiftImage
              src={maker.image.src}
              alt={maker.image.alt}
              sizes="(min-width: 1024px) 50vw, 100vw"
              preload
            />
          </div>
          <div className="lg:col-span-6">
            <p className="eyebrow mb-3">{maker.craft}</p>
            <h1 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
              {maker.name}
            </h1>
            <p className="mt-2 text-muted">{maker.location}</p>
            <p className="mt-6 font-serif text-xl">{maker.tagline}</p>

            <h2 className="mt-8 text-sm font-semibold">Their story</h2>
            <p className="mt-2">{maker.story}</p>

            {maker.process && (
              <>
                <h2 className="mt-6 text-sm font-semibold">How they make it</h2>
                <p className="mt-2">{maker.process}</p>
              </>
            )}

            <p className="mt-8 rounded-md bg-blush px-3 py-2 text-sm text-berry">
              Sample profile: {maker.name} is a fictional maker created for this
              demo, not a real business.
            </p>
          </div>
        </div>
      </div>

      <section
        aria-labelledby="maker-gifts-heading"
        className="page-container border-t border-linen py-14 lg:py-20"
      >
        <SectionHeading
          id="maker-gifts-heading"
          title={`Gifts from ${maker.name}`}
          description={`${products.length} ${products.length === 1 ? "gift" : "gifts"} made by hand.`}
        />
        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {products.map((p) => (
            <li key={p.id} className="flex">
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function MakerSkeleton() {
  return (
    <div className="page-container py-8 lg:py-12" aria-busy="true" aria-label="Loading maker">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="aspect-[4/3] animate-pulse rounded-lg bg-linen/70" />
        <div className="space-y-4">
          <div className="h-12 w-2/3 animate-pulse rounded bg-linen" />
          <div className="h-24 animate-pulse rounded bg-linen/70" />
        </div>
      </div>
    </div>
  );
}
