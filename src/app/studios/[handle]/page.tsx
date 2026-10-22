import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { instagramUrl } from "@/data/instagram-makers";
import { formatShortDate } from "@/lib/finder/dates";
import { routes } from "@/lib/routes";
import { getStudio, getStudioProducts, getStudios } from "@/lib/studios";
import { MakerProductCard } from "@/components/studio/maker-product-card";

export function generateStaticParams() {
  return getStudios().map((m) => ({ handle: m.handle }));
}

export async function generateMetadata({ params }: PageProps<"/studios/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const maker = getStudio(decodeURIComponent(handle));
  if (!maker) return { title: "Maker not found" };
  return { title: `${maker.name} · Made in Mumbai`, description: maker.makes };
}

export default function StudioPage({ params }: PageProps<"/studios/[handle]">) {
  return (
    <Suspense fallback={<div className="page-container h-96 animate-pulse py-14" />}>
      <Studio params={params} />
    </Suspense>
  );
}

async function Studio({ params }: Pick<PageProps<"/studios/[handle]">, "params">) {
  const { handle } = await params;
  const maker = getStudio(decodeURIComponent(handle));
  if (!maker) notFound();
  const products = getStudioProducts(maker.id);
  const profile = instagramUrl(maker.handle);
  const engagement =
    maker.medianLikes === null
      ? `likes hidden, ~${Math.round(maker.avgComments)} comments per post`
      : `~${Math.round(maker.medianLikes)} likes and ~${Math.round(maker.avgComments)} comments per post`;

  return (
    <div className="page-container pt-10 pb-20 sm:pt-14">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href={routes.makers} className="hover:text-burgundy">
          Makers
        </Link>{" "}
        / Made in Mumbai
      </nav>

      <header className="mt-6 max-w-3xl">
        <p className="text-sm tracking-wide text-muted">Independent studio · Mumbai · sells on Instagram</p>
        <h1 className="mt-3 font-serif text-[2.6rem] leading-[1.05] tracking-tight sm:text-6xl">{maker.name}</h1>
        <a href={profile} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-burgundy hover:underline">
          @{maker.handle}
        </a>
        <p className="mt-5 text-lg text-muted">{maker.makes}</p>
        <p className="mt-4 text-sm text-muted">
          {maker.followers.toLocaleString("en-IN")} followers · {engagement} · checked {formatShortDate(maker.checkedOn)}
        </p>
      </header>

      <section aria-labelledby="studio-products" className="mt-14">
        <div className="mb-8 max-w-2xl">
          <h2 id="studio-products" className="font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
            What they make
          </h2>
          <p className="mt-3 text-sm text-muted">
            From {maker.name}&apos;s recent Instagram posts. They don&apos;t list prices, so ask about price,
            customisation and delivery when you message them. GIFTWALA doesn&apos;t take orders or check delivery for
            this maker.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {products.map((p, i) => (
            <li key={p.id}>
              <MakerProductCard product={p} maker={maker} showPhoto={p.showPhoto} priority={i < 4} />
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="studio-visit"
        className="mt-16 flex flex-col gap-6 rounded-[1.25rem] bg-linen/60 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10"
      >
        <div>
          <h2 id="studio-visit" className="font-serif text-3xl leading-tight">
            See everything on <span className="text-burgundy italic">@{maker.handle}</span>
          </h2>
          <p className="mt-2 text-sm text-muted">Browse their full feed, then send them a DM to order.</p>
        </div>
        <a
          href={profile}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-burgundy px-6 text-sm font-medium text-white transition-colors hover:bg-burgundy-hover"
        >
          Visit their Instagram ↗
        </a>
      </section>
    </div>
  );
}
