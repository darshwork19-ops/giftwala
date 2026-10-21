"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { formatPrice } from "@/lib/format";
import { formatShortDate } from "@/lib/finder/dates";
import type { ExternalCard, FinderResponse, IdeaCard, ListingCard, MatchRequest } from "@/lib/finder/types";
import { routes } from "@/lib/routes";
import { Button, ButtonLink } from "@/components/ui/button";
import { GiftImage } from "@/components/ui/gift-image";
import { PenIcon, SparkIcon } from "@/components/ui/icons";
import { DescribeBox, type FinderView } from "./describe-box";

type Refinement = "others" | "cheaper" | "handmade" | "unusual";

const REFINEMENTS: { id: Refinement; label: string; clause?: string }[] = [
  { id: "others", label: "Show other ideas" },
  { id: "cheaper", label: "Less expensive" },
  { id: "handmade", label: "More handmade", clause: "Prefer handmade pieces." },
  { id: "unusual", label: "Something more unusual", clause: "Prefer something unusual and unexpected." },
];

type Result = { key: string } & ({ data: FinderResponse } | { error: string });

export function FinderResults() {
  const params = useSearchParams();
  const brief = params.get("brief")?.trim() ?? "";
  const view: FinderView = params.get("view") === "ideas" ? "ideas" : "buy";
  // A new description starts a fresh session (no carried-over refinements)
  return <FinderSession key={brief} brief={brief} view={view} />;
}

function FinderSession({ brief, view }: { brief: string; view: FinderView }) {
  const router = useRouter();
  // Switching views only changes the URL; results are already loaded
  const setView = (next: FinderView) => router.replace(routes.giftFinderFor(brief, next), { scroll: false });
  // Refinements keep the original description and add to it
  const [refine, setRefine] = useState<{ clauses: string[]; exclude: string[]; budgetMax?: number }>({
    clauses: [],
    exclude: [],
  });
  const [mode, setMode] = useState<"auto" | "rules">("auto");
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result>();
  const [editing, setEditing] = useState(false);

  const request: MatchRequest = useMemo(
    () => ({ brief: [brief, ...refine.clauses].join(" "), exclude: refine.exclude, budgetMax: refine.budgetMax, mode }),
    [brief, refine, mode],
  );
  const key = `${JSON.stringify(request)}#${attempt}`;

  useEffect(() => {
    if (!brief) return;
    const controller = new AbortController();
    fetch("/api/match", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request),
      signal: controller.signal,
    })
      .then(async (res) => {
        const json = await res.json();
        setResult(res.ok ? { key, data: json } : { key, error: json.error ?? "Something went wrong." });
      })
      .catch((error) => {
        if (error.name !== "AbortError") setResult({ key, error: "We couldn't reach the Gift Finder. Please try again." });
      });
    return () => controller.abort();
  }, [brief, key, request]);

  if (!brief || editing) {
    return (
      <div className="max-w-2xl">
        <DescribeBox defaultValue={brief} defaultView={view} size="lg" />
        {editing && (
          <button type="button" onClick={() => setEditing(false)} className="mt-3 text-sm text-muted hover:text-burgundy">
            Cancel
          </button>
        )}
      </div>
    );
  }

  const loading = result?.key !== key;
  const data = !loading && result && "data" in result ? result.data : undefined;
  const fetchError = !loading && result && "error" in result ? result.error : undefined;

  const applyRefinement = (r: Refinement) => {
    if (!data) return;
    const shown = data.listings.map((m) => m.id);
    setRefine((prev) => {
      const next = { ...prev, exclude: [...prev.exclude, ...shown] };
      const option = REFINEMENTS.find((x) => x.id === r);
      if (option?.clause && !prev.clauses.includes(option.clause)) next.clauses = [...prev.clauses, option.clause];
      if (r === "cheaper" && data.listings.length) {
        next.budgetMax = Math.round(Math.min(...data.listings.map((m) => m.price)) * 0.95);
        next.exclude = prev.exclude;
      }
      return next;
    });
  };

  return (
    <div>
      <section aria-labelledby="brief-heading" className="rounded-lg border border-linen bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 id="brief-heading" className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">
              You told us
            </h2>
            <p className="mt-1 font-serif text-xl">“{brief}”</p>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex shrink-0 items-center gap-1.5 self-start text-sm font-medium text-burgundy hover:underline"
          >
            <PenIcon width={16} height={16} /> Edit your description
          </button>
        </div>
        {data && (data.status === "results" || data.status === "no_match") && <Understood data={data} />}
      </section>

      <div aria-live="polite" className="mt-10">
        {loading && <LoadingCards />}
        {fetchError && (
          <Notice tone="error" title="Something went wrong">
            <p>{fetchError}</p>
            <Button className="mt-4" onClick={() => setAttempt((a) => a + 1)}>Try again</Button>
          </Notice>
        )}
        {data && (
          <Outcome
            data={data}
            brief={brief}
            view={view}
            onViewChange={setView}
            onEdit={() => setEditing(true)}
            onRetry={() => setAttempt((a) => a + 1)}
            onUseRules={() => setMode("rules")}
            onRefine={applyRefinement}
            refined={refine.clauses.length > 0 || refine.exclude.length > 0 || Boolean(refine.budgetMax)}
            onResetRefine={() => setRefine({ clauses: [], exclude: [] })}
          />
        )}
      </div>
    </div>
  );
}

interface OutcomeProps {
  data: FinderResponse;
  brief: string;
  view: FinderView;
  onViewChange: (view: FinderView) => void;
  onEdit: () => void;
  onRetry: () => void;
  onUseRules: () => void;
  onRefine: (r: Refinement) => void;
  refined: boolean;
  onResetRefine: () => void;
}

function Outcome({ data, brief, view, onViewChange, onEdit, onRetry, onUseRules, ...refineProps }: OutcomeProps) {
  switch (data.status) {
    case "nonsense":
    case "off_topic":
      return (
        <Notice title={data.status === "nonsense" ? "We couldn't understand that" : "That's outside what we can help with"}>
          <p>{data.message}</p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button onClick={onEdit}>Edit your description</Button>
            <ButtonLink href={routes.gifts} variant="secondary">Explore all gifts</ButtonLink>
          </div>
        </Notice>
      );
    case "follow_up":
      return <FollowUp data={data} brief={brief} view={view} />;
    case "ai_error":
      return (
        <Notice tone="error" title="Gift matching is unavailable right now">
          <p>{data.message}</p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button onClick={onRetry}>Try again</Button>
            <Button variant="secondary" onClick={onUseRules}>Show keyword matches instead</Button>
          </div>
          <p className="mt-3 text-xs text-muted">
            Keyword matches use simple word matching against the catalogue, without AI explanations.
          </p>
        </Notice>
      );
    case "no_match":
      return (
        <Notice title="No strong match yet">
          <p>{data.message}</p>
          {data.deliveryNote && <p className="mt-2">{data.deliveryNote}</p>}
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button onClick={onEdit}>Edit your description</Button>
            <ButtonLink href={routes.gifts} variant="secondary">Explore all gifts</ButtonLink>
          </div>
        </Notice>
      );
    case "results":
      return <Results data={data} view={view} onViewChange={onViewChange} {...refineProps} />;
  }
}

function Results({
  data,
  view,
  onViewChange,
  onRefine,
  refined,
  onResetRefine,
}: Pick<OutcomeProps, "data" | "view" | "onViewChange" | "onRefine" | "refined" | "onResetRefine">) {
  const buyCount = data.listings.length + data.external.length;
  const ideaCount = data.ideas.length;

  return (
    <>
      <div role="tablist" aria-label="What to show" className="mb-8 inline-flex rounded-md border border-linen bg-white p-1">
        {(
          [
            { id: "buy", label: "Things you can buy", count: buyCount },
            { id: "ideas", label: "Gift ideas", count: ideaCount },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={view === tab.id}
            onClick={() => onViewChange(tab.id)}
            className="rounded px-4 py-2 text-sm font-medium text-muted transition-colors aria-selected:bg-burgundy aria-selected:text-white"
          >
            {tab.label} <span className="opacity-80">({tab.count})</span>
          </button>
        ))}
      </div>

      {view === "ideas" ? (
        <IdeasView data={data} onSwitch={() => onViewChange("buy")} buyCount={buyCount} />
      ) : (
        <BuyView data={data} onSwitch={() => onViewChange("ideas")} onRefine={onRefine} refined={refined} onResetRefine={onResetRefine} />
      )}
    </>
  );
}

function BuyView({
  data,
  onSwitch,
  onRefine,
  refined,
  onResetRefine,
}: Pick<OutcomeProps, "data" | "onRefine" | "refined" | "onResetRefine"> & { onSwitch: () => void }) {
  const count = data.listings.length;
  const nothingToBuy = count === 0 && data.external.length === 0;

  return (
    <>
      {nothingToBuy && (
        <Notice title="Nothing to buy matches yet">
          <p>Neither the GIFTWALA catalogue nor the online shops we list have something that fits this description.</p>
          {data.ideas.length > 0 && (
            <Button className="mt-4" onClick={onSwitch}>
              See {data.ideas.length} gift {data.ideas.length === 1 ? "idea" : "ideas"} instead
            </Button>
          )}
        </Notice>
      )}

      {count > 0 && (
        <section aria-labelledby="listings-heading">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="listings-heading" className="font-serif text-3xl tracking-tight">
              {count === 1 ? "1 gift from GIFTWALA" : `${count} gifts from GIFTWALA`}
            </h2>
            <p className="inline-flex items-center gap-1.5 text-xs text-muted">
              <SparkIcon width={14} height={14} />
              {data.mode === "ai"
                ? `Chosen and explained by ${data.provider ?? "AI"} from matching catalogue gifts`
                : "Matched by keywords from your description"}
            </p>
          </div>
          <ul className="grid gap-8 md:grid-cols-3">
            {data.listings.map((listing, i) => (
              <li key={listing.id}>
                <ListingView listing={listing} rank={i + 1} requestHref={requestHref(listing, data)} />
              </li>
            ))}
          </ul>
          {data.excludedNote && <p className="mt-6 text-sm text-muted">{data.excludedNote}</p>}
          {data.deliveryNote && <p className="mt-2 text-sm text-muted">{data.deliveryNote}</p>}

          <div className="mt-8 flex flex-col gap-4 border-t border-linen pt-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-3 text-sm font-medium">Not quite right?</p>
              <div className="flex flex-wrap gap-2">
                {REFINEMENTS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => onRefine(r.id)}
                    disabled={r.id === "others" && data.remaining === 0}
                    className="rounded-full border border-charcoal/20 bg-white px-4 py-2 text-sm transition-colors hover:border-burgundy hover:text-burgundy disabled:opacity-50"
                  >
                    {r.label}
                  </button>
                ))}
                {refined && (
                  <button type="button" onClick={onResetRefine} className="px-2 py-2 text-sm text-muted underline-offset-4 hover:underline">
                    Start over
                  </button>
                )}
              </div>
            </div>
            <ButtonLink href={routes.giftBox} variant="secondary" className="shrink-0">
              Mix and match a gift box
            </ButtonLink>
          </div>
        </section>
      )}

      {data.external.length > 0 && (
        <section aria-labelledby="external-heading" className={count > 0 ? "mt-16" : ""}>
          <h2 id="external-heading" className="font-serif text-3xl tracking-tight">From online shops</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Sold by the shop, not GIFTWALA. Prices are as we last checked them; stock, delivery, payment and returns
            are handled by the shop.
          </p>
          <ul className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {data.external.map((product) => (
              <li key={product.id}>
                <ExternalView product={product} />
              </li>
            ))}
          </ul>
          {count === 0 && data.excludedNote && <p className="mt-6 text-sm text-muted">{data.excludedNote}</p>}
        </section>
      )}

      {data.popular.length > 0 && (
        <section aria-labelledby="popular-heading" className="mt-16 border-t border-linen pt-12">
          <h2 id="popular-heading" className="font-serif text-2xl tracking-tight">Popular gifts anyone would enjoy</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Well-loved gifts from the GIFTWALA catalogue. These aren&apos;t matched to your description.
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {data.popular.map((listing) => (
              <li key={listing.id}>
                <ListingView listing={listing} rank={9} requestHref={requestHref(listing, data)} compact />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function IdeasView({ data, onSwitch, buyCount }: { data: FinderResponse; onSwitch: () => void; buyCount: number }) {
  if (data.ideas.length === 0) {
    return (
      <Notice title="No gift ideas for this one">
        <p>We don&apos;t have ideas that match this description yet.</p>
        {buyCount > 0 && (
          <Button className="mt-4" onClick={onSwitch}>
            See {buyCount} {buyCount === 1 ? "thing" : "things"} you can buy
          </Button>
        )}
      </Notice>
    );
  }
  return (
    <section aria-labelledby="ideas-heading">
      <h2 id="ideas-heading" className="font-serif text-3xl tracking-tight">Gift ideas to look for</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Ideas, not listings: no price, stock, seller or delivery has been checked. Use them as a starting point
        wherever you shop.
      </p>
      <ul className="mt-6 grid gap-5 md:grid-cols-2">
        {data.ideas.map((idea) => (
          <li key={idea.id}>
            <IdeaView idea={idea} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ExternalView({ product }: { product: ExternalCard }) {
  return (
    <article className="flex h-full flex-col">
      <a href={product.url} target="_blank" rel="noopener noreferrer" className="group block">
        <div className="relative aspect-square overflow-hidden rounded-md bg-white">
          <GiftImage
            src={product.image.src}
            alt={product.image.alt}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </div>
      </a>
      <div className="flex flex-1 flex-col pt-4">
        <p className="text-xs text-muted">
          <span className="font-medium text-charcoal">Online shop</span> · {product.shop.name}
          {product.adultsOnly && (
            <span className="ml-1.5 rounded bg-linen px-1.5 py-0.5 text-[0.7rem] font-medium text-charcoal">18+ barware</span>
          )}
        </p>
        <h3 className="mt-1.5 text-[0.95rem] leading-snug font-medium">{product.name}</h3>
        <p className="mt-2 text-sm text-muted">{product.reason}</p>
        <p className="mt-3 text-sm">
          <span className="font-semibold">{formatPrice(product.price)}</span>
          {product.compareAt && product.compareAt > product.price && (
            <span className="ml-2 text-xs text-muted line-through">{formatPrice(product.compareAt)}</span>
          )}
        </p>
        <p className="mt-0.5 text-xs text-muted">Price checked {formatShortDate(product.priceCheckedOn)} · may have changed</p>
        <div className="mt-auto pt-4">
          <ButtonLink href={product.url} target="_blank" rel="noopener noreferrer" variant="secondary" className="w-full">
            View on {product.shop.name} ↗
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}

function FollowUp({ data, brief, view }: { data: FinderResponse; brief: string; view: FinderView }) {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  // The answer is added to the original description, so nothing is lost
  const extend = (more: string) =>
    router.push(routes.giftFinderFor(`${brief.replace(/[.\s]+$/, "")}. ${more}`, view));
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (answer.trim()) extend(answer.trim());
  };
  return (
    <Notice title={data.followUp?.question ?? "Tell us a bit more"}>
      <p>{data.message}</p>
      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="follow-up" className="sr-only">Your answer</label>
        <input
          id="follow-up"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="e.g. Plays badminton and loves cars"
          className="h-11 min-w-0 flex-1 rounded-md border border-linen bg-white px-3 text-sm text-charcoal focus:border-burgundy"
        />
        <Button type="submit">Add this</Button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2" aria-label="Suggestions">
        {data.followUp?.suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => extend(s)}
            className="rounded-full border border-linen bg-white px-3 py-1.5 text-sm text-muted hover:border-burgundy hover:text-burgundy"
          >
            {s}
          </button>
        ))}
      </div>
    </Notice>
  );
}

function Notice({ title, tone = "info", children }: { title: string; tone?: "info" | "error"; children: React.ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={`max-w-2xl rounded-lg border bg-white p-6 ${tone === "error" ? "border-berry/40" : "border-linen"}`}
    >
      <h2 className={`font-serif text-2xl ${tone === "error" ? "text-berry" : ""}`}>{title}</h2>
      <div className="mt-2 text-sm text-muted">{children}</div>
    </div>
  );
}

function Understood({ data }: { data: FinderResponse }) {
  const u = data.understood;
  const chips = [
    u.recipient && `For: ${u.recipient}`,
    u.occasion && `Occasion: ${u.occasion}`,
    u.budgetMax !== undefined && `Up to ${formatPrice(u.budgetMax)}`,
    u.date && `By ${u.date.label}`,
    u.destination && u.destination.label,
    ...u.interests,
  ].filter(Boolean) as string[];
  const missing = [!u.destination && "a Mumbai area or PIN", !u.date && "a date"].filter(Boolean) as string[];

  return (
    <div className="mt-4 border-t border-linen pt-4">
      {u.summary && <p className="mb-3 text-sm">{u.summary}</p>}
      {chips.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="What we understood">
          {chips.map((chip) => (
            <li key={chip} className="rounded-full bg-blush px-3 py-1 text-xs font-medium text-burgundy">
              {chip}
            </li>
          ))}
        </ul>
      )}
      {missing.length > 0 && data.listings.length > 0 && (
        <p className="mt-3 text-xs text-muted">Add {missing.join(" and ")} to check delivery for catalogue gifts.</p>
      )}
    </div>
  );
}

/** The request form opens pre-filled with the date and Mumbai area from the brief. */
function requestHref(listing: ListingCard, data: FinderResponse): string {
  const q = new URLSearchParams();
  if (data.understood.date) q.set("date", data.understood.date.iso);
  if (data.understood.destination?.kind === "zone") q.set("area", data.understood.destination.label.split(" · ")[0]);
  const query = q.toString();
  return routes.requestGift(listing.slug) + (query ? `?${query}` : "");
}

function ListingView({
  listing,
  rank,
  requestHref,
  compact = false,
}: {
  listing: ListingCard;
  rank: number;
  requestHref: string;
  compact?: boolean;
}) {
  const estimated = listing.delivery.status === "estimated";
  return (
    <article className="flex h-full flex-col">
      <Link href={routes.product(listing.slug)} className="group block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-linen md:aspect-[4/5]">
          <GiftImage
            src={listing.image.src}
            alt={listing.image.alt}
            sizes="(min-width: 768px) 33vw, 100vw"
            preload={rank === 1}
            className="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </div>
      </Link>
      <div className="flex flex-1 flex-col pt-4">
        <p className="text-xs text-muted">
          <span className="font-medium text-charcoal">GIFTWALA listing</span> · sample maker{" "}
          <Link href={routes.maker(listing.maker.slug)} className="hover:text-burgundy">
            {listing.maker.name}
          </Link>
        </p>
        <h3 className="mt-1.5 font-serif text-xl leading-snug">
          <Link href={routes.product(listing.slug)} className="hover:text-burgundy">
            {listing.name}
          </Link>
        </h3>
        {!compact && <p className="mt-2 text-sm">{listing.reason}</p>}
        <p className="mt-3 text-sm font-semibold">{formatPrice(listing.price)}</p>
        <p className={`mt-1 text-xs ${estimated ? "text-sage" : "text-muted"}`}>
          <span aria-hidden="true">{estimated ? "✓ " : "ⓘ "}</span>
          {listing.delivery.label}
        </p>
        {listing.personalisable && (
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-burgundy">
            <PenIcon width={14} height={14} /> Personalisable
          </p>
        )}
        <div className="mt-auto pt-5">
          <ButtonLink href={requestHref} className="w-full">
            Request this gift
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}

function IdeaView({ idea }: { idea: IdeaCard }) {
  return (
    <article className="h-full rounded-lg border border-dashed border-terracotta bg-white p-5">
      <p className="text-xs font-semibold tracking-[0.12em] text-muted uppercase">Gift idea · {idea.category}</p>
      <h3 className="mt-2 font-serif text-xl leading-snug">{idea.title}</h3>
      <p className="mt-2 text-sm">{idea.summary}</p>
      <p className="mt-2 text-xs text-muted">{idea.reason}</p>
      <h4 className="mt-4 text-xs font-semibold">Before you buy, check</h4>
      <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-sm text-muted">
        {idea.lookFor.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">Usually found at: {idea.whereToFind}</p>
    </article>
  );
}

function LoadingCards() {
  return (
    <div>
      <p className="mb-6 text-sm text-muted">Reading your description and checking the catalogue…</p>
      <ul className="grid gap-8 md:grid-cols-3" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <li key={i} className="animate-pulse">
            <div className="aspect-[4/5] rounded-md bg-linen" />
            <div className="mt-4 h-3 w-1/3 rounded bg-linen" />
            <div className="mt-3 h-5 w-2/3 rounded bg-linen" />
          </li>
        ))}
      </ul>
    </div>
  );
}
