"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { formatPrice } from "@/lib/format";
import { formatShortDate } from "@/lib/finder/dates";
import type {
  ExternalCard,
  FinderResponse,
  IdeaCard,
  ListingCard,
  MakerProductCard,
  MatchRequest,
  Preference,
  ResultGroup,
  ResultRef,
} from "@/lib/finder/types";
import { routes } from "@/lib/routes";
import { GiftImage } from "@/components/ui/gift-image";
import { AiIllustration } from "@/components/ui/ai-illustration";
import { ArrowRightIcon, PenIcon } from "@/components/ui/icons";
import { DescribeBox, type FinderView } from "./describe-box";
import { GiftQuiz } from "./gift-quiz";

type Refinement = "others" | "cheaper" | Preference;

const REFINEMENTS: { id: Refinement; label: string }[] = [
  { id: "practical", label: "More practical" },
  { id: "unusual", label: "More unusual" },
  { id: "experiences", label: "More experiences" },
  { id: "handmade", label: "More handmade" },
  { id: "cheaper", label: "Lower budget" },
  { id: "others", label: "Show other catalogue gifts" },
];

type Result = { key: string } & ({ data: FinderResponse } | { error: string });

// Shared pill styles, matching the homepage search
const primaryPill =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-burgundy px-5 text-sm font-medium text-white transition-colors hover:bg-burgundy-hover";
const secondaryPill =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-charcoal/20 px-5 text-sm font-medium text-charcoal transition-colors hover:border-burgundy hover:text-burgundy";
const textLink =
  "inline-flex items-center gap-1.5 text-sm font-medium text-charcoal underline decoration-linen underline-offset-4 transition-colors hover:text-burgundy hover:decoration-burgundy";

export function FinderResults() {
  const params = useSearchParams();
  const brief = params.get("brief")?.trim() ?? "";
  const raw = params.get("view");
  const view: FinderView = raw === "ideas" || raw === "buy" ? raw : "all";
  // A new description starts a fresh session (no carried-over refinements)
  return <FinderSession key={brief} brief={brief} view={view} />;
}

function FinderSession({ brief, view }: { brief: string; view: FinderView }) {
  const router = useRouter();
  // Switching views only changes the URL; results are already loaded
  const setView = (next: FinderView) => router.replace(routes.giftFinderFor(brief, next), { scroll: false });
  // Refinements keep the original description and every constraint in it
  const [refine, setRefine] = useState<{ exclude: string[]; budgetMax?: number; prefer?: Preference }>({
    exclude: [],
  });
  const [mode, setMode] = useState<"auto" | "rules">("auto");
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result>();
  const [editing, setEditing] = useState(false);
  // Editing an existing description opens the text box; a fresh start opens the picker
  const [typing, setTyping] = useState(false);

  const request: MatchRequest = useMemo(
    () => ({ brief, exclude: refine.exclude, budgetMax: refine.budgetMax, prefer: refine.prefer, mode }),
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
      <div>
        {typing ? (
          <>
            <DescribeBox defaultValue={brief} defaultView={view} />
            <button type="button" onClick={() => setTyping(false)} className={`mt-4 ${textLink} text-muted`}>
              ← Back to picking options
            </button>
          </>
        ) : (
          <div className="max-w-2xl">
            <GiftQuiz onTypeInstead={() => setTyping(true)} />
          </div>
        )}
        {editing && (
          <button type="button" onClick={() => setEditing(false)} className={`mt-6 ${textLink} text-muted`}>
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
    setRefine((prev) => {
      if (r === "others") return { ...prev, exclude: [...prev.exclude, ...data.listings.map((m) => m.id)] };
      if (r === "cheaper") return { ...prev, budgetMax: lowerBudget(data) };
      // A second tap on the same preference turns it off
      return { ...prev, prefer: prev.prefer === r ? undefined : r };
    });
  };

  return (
    <div>
      <section aria-labelledby="brief-heading" className="max-w-3xl border-l-2 border-terracotta pl-5 sm:pl-6">
        <h2 id="brief-heading" className="text-sm text-muted">
          You told us
        </h2>
        <p className="mt-1 font-serif text-2xl leading-snug italic sm:text-[1.75rem]">“{brief}”</p>
        <button type="button" onClick={() => setEditing(true)} className={`mt-3 ${textLink}`}>
          <PenIcon width={15} height={15} /> Edit your description
        </button>
        {data && (data.status === "results" || data.status === "no_match") && <Understood data={data} />}
      </section>

      <div aria-live="polite" className="mt-12">
        {loading && <LoadingCards />}
        {fetchError && (
          <Notice tone="error" title="Something went wrong">
            <p>{fetchError}</p>
            <div className="mt-5">
              <button type="button" className={primaryPill} onClick={() => setAttempt((a) => a + 1)}>
                Try again
              </button>
            </div>
          </Notice>
        )}
        {data && (
          <Outcome
            data={data}
            brief={brief}
            view={view}
            onViewChange={setView}
            onEdit={() => {
              setEditing(true);
              setTyping(false);
            }}
            onRetry={() => setAttempt((a) => a + 1)}
            onUseRules={() => setMode("rules")}
            onRefine={applyRefinement}
            refined={refine.exclude.length > 0 || Boolean(refine.budgetMax) || Boolean(refine.prefer)}
            prefer={refine.prefer}
            onResetRefine={() => setRefine({ exclude: [] })}
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
  prefer?: Preference;
  onResetRefine: () => void;
}

function Outcome({ data, brief, view, onViewChange, onEdit, onRetry, onUseRules, ...refineProps }: OutcomeProps) {
  switch (data.status) {
    case "nonsense":
    case "off_topic":
      return (
        <Notice title={data.status === "nonsense" ? "We couldn't understand that" : "That's outside what we can help with"}>
          <p>{data.message}</p>
          <NoticeActions onEdit={onEdit} />
        </Notice>
      );
    case "follow_up":
      return <FollowUp data={data} brief={brief} view={view} />;
    case "ai_error":
      return (
        <Notice tone="error" title="Gift matching is unavailable right now">
          <p>{data.message}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button type="button" className={primaryPill} onClick={onRetry}>
              Try again
            </button>
            <button type="button" className={secondaryPill} onClick={onUseRules}>
              Show keyword matches instead
            </button>
          </div>
          <p className="mt-3 text-xs">
            Keyword matches use simple word matching against the catalogue, without AI explanations.
          </p>
        </Notice>
      );
    case "no_match":
      return (
        <Notice title="No strong match yet">
          <p>{data.message}</p>
          {data.deliveryNote && <p className="mt-2">{data.deliveryNote}</p>}
          <NoticeActions onEdit={onEdit} />
        </Notice>
      );
    case "results":
      return <Results data={data} view={view} onViewChange={onViewChange} onEdit={onEdit} {...refineProps} />;
  }
}

function NoticeActions({ onEdit }: { onEdit: () => void }) {
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      <button type="button" className={primaryPill} onClick={onEdit}>
        Edit your description
      </button>
      <Link href={routes.gifts} className={secondaryPill}>
        Explore all gifts
      </Link>
    </div>
  );
}

const GROUPS: { id: ResultGroup; title: string }[] = [
  { id: "best", title: "Best matches" },
  { id: "experiences", title: "Experiences" },
  { id: "hobby", title: "Gear, upgrades and learning" },
  { id: "makers", title: "From Mumbai makers" },
  { id: "more", title: "More to explore" },
];

const BUYABLE: ResultRef["kind"][] = ["listing", "external", "maker-product"];

/** The new budget for "Lower budget": below the cheapest priced result, or 30% under the stated budget. */
function lowerBudget(data: FinderResponse): number | undefined {
  const prices = [...data.listings.map((l) => l.price), ...data.external.map((e) => e.price)];
  if (prices.length) return Math.max(100, Math.round(Math.min(...prices) * 0.95));
  return data.understood.budgetMax ? Math.round(data.understood.budgetMax * 0.7) : undefined;
}

function Results({
  data,
  view,
  onViewChange,
  onEdit,
  onRefine,
  refined,
  prefer,
  onResetRefine,
}: Pick<OutcomeProps, "data" | "view" | "onViewChange" | "onEdit" | "onRefine" | "refined" | "prefer" | "onResetRefine">) {
  // "Focus on one interest": an instant filter on words the results matched
  const [focus, setFocus] = useState<string>();
  const words = [...new Set(data.results.flatMap((r) => r.matched))].slice(0, 6);
  const shown = data.results.filter(
    (r) =>
      (view === "all" || (view === "buy" ? BUYABLE.includes(r.kind) : r.kind === "idea")) &&
      (!focus || r.matched.includes(focus)),
  );
  const buyCount = data.results.filter((r) => BUYABLE.includes(r.kind)).length;
  const ideaCount = data.results.length - buyCount;
  const canLower = lowerBudget(data) !== undefined;

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="results-heading" className="font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
            {shown.length === 1 ? "1 gift to explore" : `${shown.length} gifts to explore`}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {(
              [
                [data.results.filter((r) => r.kind === "listing").length, "on GIFTWALA"],
                [data.results.filter((r) => r.kind === "external" || r.kind === "maker-product").length, "from shops and makers"],
                [ideaCount, ideaCount === 1 ? "idea to look for" : "ideas to look for"],
              ] as const
            )
              .filter(([n]) => n > 0)
              .map(([n, label]) => `${n} ${label}`)
              .join(" · ")}
            {data.mode === "ai" && data.listings.length > 0 && ` · catalogue picks chosen and explained by ${data.provider ?? "AI"}`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-10 space-y-3">
        <div role="tablist" aria-label="What to show" className="flex flex-wrap gap-2">
          {(
            [
              { id: "all", label: "Everything", count: data.results.length },
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
              className="rounded-full border border-charcoal/15 px-4 py-1.5 text-sm transition-colors hover:border-burgundy aria-selected:border-burgundy aria-selected:bg-burgundy aria-selected:text-white"
            >
              {tab.label} <span className="opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>
        {words.length > 1 && (
          <div className="flex flex-wrap items-center gap-2 text-sm" role="group" aria-label="Focus on one interest">
            <span className="text-muted">Focus on</span>
            {words.map((w) => (
              <button
                key={w}
                type="button"
                aria-pressed={focus === w}
                onClick={() => setFocus(focus === w ? undefined : w)}
                className="rounded-full bg-blush px-3 py-1 text-xs text-burgundy transition-colors aria-pressed:bg-burgundy aria-pressed:text-white"
              >
                {w}
              </button>
            ))}
          </div>
        )}
      </div>

      {shown.length === 0 ? (
        <Notice title={view === "buy" ? "Nothing to buy matches yet" : "Nothing here for this filter"}>
          <p>
            {view === "buy"
              ? "Nothing in the GIFTWALA catalogue, our online shops or our Mumbai makers fits this description yet."
              : "Try another filter, or clear the interest you're focusing on."}
          </p>
          <div className="mt-6">
            <button type="button" className={primaryPill} onClick={() => { setFocus(undefined); onViewChange("all"); }}>
              Show everything
            </button>
          </div>
        </Notice>
      ) : (
        GROUPS.map((g) => {
          const items = shown.filter((r) => r.group === g.id);
          if (items.length === 0) return null;
          return (
            <section key={g.id} aria-labelledby={`group-${g.id}`} className="mb-14">
              <h3 id={`group-${g.id}`} className="mb-6 font-serif text-2xl tracking-tight">
                {g.title} <span className="text-base text-muted">({items.length})</span>
              </h3>
              <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((ref, i) => (
                  <li key={`${ref.kind}:${ref.id}`}>
                    <ResultCard result={ref} data={data} priority={g.id === "best" && i === 0} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}

      {data.limited && (
        <div className="mb-10 rounded-[1.25rem] border border-linen bg-white/70 p-6">
          <p className="font-serif text-xl">Want more options?</p>
          <p className="mt-2 text-sm text-muted">{data.limited.note}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
            {data.limited.broaden.includes("interests") && <li>Add another interest or hobby they have.</li>}
            {data.limited.broaden.includes("budget") && <li>Raise the budget: some fitting gifts cost a little more.</li>}
            {data.limited.broaden.includes("date") && <li>Allow a later date: some gifts need more time.</li>}
            {data.limited.broaden.includes("area") && <li>Check the delivery area: some makers don&apos;t deliver there.</li>}
          </ul>
          <button type="button" onClick={onEdit} className={`mt-5 ${secondaryPill}`}>
            <PenIcon width={15} height={15} /> Edit your description
          </button>
        </div>
      )}
      {(data.excludedNote || data.deliveryNote) && (
        <div className="mb-8 space-y-1 text-sm text-muted">
          {data.excludedNote && <p>{data.excludedNote}</p>}
          {data.deliveryNote && <p>{data.deliveryNote}</p>}
        </div>
      )}

      <div className="flex flex-col gap-6 rounded-[1.25rem] bg-linen/50 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-serif text-xl">Refine these results</p>
          <p className="mt-1 text-xs text-muted">Your description, budget and delivery details stay the same.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {REFINEMENTS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onRefine(r.id)}
                aria-pressed={r.id === prefer}
                disabled={(r.id === "others" && data.remaining === 0) || (r.id === "cheaper" && !canLower)}
                className="rounded-full border border-charcoal/15 bg-ivory px-3.5 py-1.5 text-sm transition-colors hover:border-burgundy hover:text-burgundy aria-pressed:border-burgundy aria-pressed:bg-burgundy aria-pressed:text-white disabled:opacity-50 disabled:hover:border-charcoal/15 disabled:hover:text-charcoal"
              >
                {r.label}
              </button>
            ))}
            {refined && (
              <button type="button" onClick={onResetRefine} className={`px-2 ${textLink} text-muted`}>
                Start over
              </button>
            )}
          </div>
        </div>
        <Link href={routes.giftBox} className={`${textLink} shrink-0`}>
          Mix and match a gift box <ArrowRightIcon width={15} height={15} />
        </Link>
      </div>

      {data.popular.length > 0 && (
        <section aria-labelledby="popular-heading" className="mt-16 border-t border-linen pt-14">
          <div className="mb-8 max-w-2xl">
            <h2 id="popular-heading" className="font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
              Popular gifts anyone would enjoy
            </h2>
            <p className="mt-3 text-sm text-muted">
              Well-loved gifts from the GIFTWALA catalogue. These aren&apos;t matched to your description and aren&apos;t counted above.
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
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

/** Renders one shortlist entry with the card for its kind; each card carries its own source label. */
function ResultCard({ result, data, priority }: { result: ResultRef; data: FinderResponse; priority: boolean }) {
  switch (result.kind) {
    case "listing": {
      const listing = data.listings.find((l) => l.id === result.id);
      return listing ? <ListingView listing={listing} rank={priority ? 1 : 9} requestHref={requestHref(listing, data)} /> : null;
    }
    case "external": {
      const product = data.external.find((e) => e.id === result.id);
      return product ? <ExternalView product={product} /> : null;
    }
    case "maker-product": {
      const product = data.makerProducts.find((m) => m.id === result.id);
      return product ? <MakerProductView product={product} budgetMax={data.understood.budgetMax} /> : null;
    }
    case "idea": {
      const idea = data.ideas.find((i) => i.id === result.id);
      return idea ? <IdeaView idea={idea} /> : null;
    }
  }
}

function MakerProductView({ product, budgetMax }: { product: MakerProductCard; budgetMax?: number }) {
  return (
    <article className="flex h-full flex-col">
      <Link href={product.maker.studioUrl} className="group block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1rem] bg-linen md:aspect-[4/5]">
          {product.image ? (
            <GiftImage
              src={product.image.src}
              alt={product.image.alt}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center p-6 text-center font-serif text-xl text-muted">
              {product.category}
            </span>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col pt-4">
        <p className="text-xs text-muted">
          Mumbai maker · <Link href={product.maker.studioUrl} className="hover:text-burgundy">{product.maker.name}</Link>
          {product.image && ` · Photo @${product.maker.handle}`}
        </p>
        <h3 className="mt-2 font-serif text-xl leading-snug">{product.name}</h3>
        <p className="mt-2 text-sm text-muted">{product.reason}</p>
        <p className="mt-3 text-xs text-charcoal">
          {budgetMax !== undefined
            ? `Price on request: ask if it fits your ${formatPrice(budgetMax)} budget.`
            : "Price on request."}{" "}
          Delivery isn&apos;t checked by GIFTWALA.
        </p>
        <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-4">
          <Link href={product.maker.studioUrl} className={textLink}>
            See their gifts <ArrowRightIcon width={15} height={15} />
          </Link>
          <a href={product.postUrl} target="_blank" rel="noopener noreferrer" className={`${textLink} text-muted`}>
            Instagram post ↗
          </a>
        </div>
      </div>
    </article>
  );
}

function ExternalView({ product }: { product: ExternalCard }) {
  return (
    <article className="flex h-full flex-col">
      <a href={product.url} target="_blank" rel="noopener noreferrer" className="group block">
        <div className="relative aspect-square overflow-hidden rounded-[1rem] border border-linen bg-white">
          {product.image ? (
            <GiftImage
              src={product.image.src}
              alt={product.image.alt}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <AiIllustration theme={product.illustration} />
          )}
        </div>
      </a>
      <div className="flex flex-1 flex-col pt-4">
        <p className="text-xs text-muted">
          Online shop · {product.shop.name}
          {product.adultsOnly && (
            <span className="ml-1.5 rounded-full border border-charcoal/20 px-2 py-0.5 text-[0.7rem] text-charcoal">
              18+ barware
            </span>
          )}
        </p>
        <h3 className="mt-2 font-serif text-xl leading-snug">{product.name}</h3>
        <p className="mt-2 text-sm text-muted">{product.reason}</p>
        <p className="mt-3 text-[0.95rem]">
          <span className="font-medium">{formatPrice(product.price)}</span>
          {product.compareAt && product.compareAt > product.price && (
            <span className="ml-2 text-xs text-muted line-through">{formatPrice(product.compareAt)}</span>
          )}
        </p>
        <p className="mt-0.5 text-xs text-muted">Price checked {formatShortDate(product.priceCheckedOn)} · may have changed</p>
        <a href={product.url} target="_blank" rel="noopener noreferrer" className={`mt-auto self-start pt-4 ${textLink}`}>
          View on {product.shop.name} ↗
        </a>
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
      <form
        onSubmit={onSubmit}
        className="mt-6 flex items-center gap-2 rounded-full border border-charcoal/15 bg-white p-1.5 pl-5 shadow-soft focus-within:border-burgundy"
      >
        <label htmlFor="follow-up" className="sr-only">Your answer</label>
        <input
          id="follow-up"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="e.g. Plays badminton and loves cars"
          className="h-11 min-w-0 flex-1 bg-transparent text-[0.95rem] text-charcoal placeholder:text-muted/80 focus:outline-none"
        />
        <button type="submit" className={`${primaryPill} shrink-0`}>
          Add this
        </button>
      </form>
      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2" aria-label="Suggestions">
        {data.followUp?.suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => extend(s)}
            className="text-sm text-muted underline decoration-linen underline-offset-4 hover:text-burgundy hover:decoration-burgundy"
          >
            {s}
          </button>
        ))}
      </div>
    </Notice>
  );
}

/** State messages: calm text, no box. */
function Notice({ title, tone = "info", children }: { title: string; tone?: "info" | "error"; children: React.ReactNode }) {
  return (
    <div role={tone === "error" ? "alert" : undefined} className="max-w-2xl">
      <h2 className={`font-serif text-3xl leading-tight tracking-tight sm:text-4xl ${tone === "error" ? "text-berry" : ""}`}>
        {title}
      </h2>
      <div className="mt-3 text-muted">{children}</div>
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
    <div className="mt-6">
      {u.summary && <p className="text-sm">{u.summary}</p>}
      {chips.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="What we understood">
          {chips.map((chip) => (
            <li key={chip} className="rounded-full border border-linen bg-white/60 px-3 py-1 text-xs text-charcoal">
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
        <div className={`relative overflow-hidden rounded-[1rem] bg-linen ${compact ? "aspect-[4/5]" : "aspect-[4/3] md:aspect-[4/5]"}`}>
          <GiftImage
            src={listing.image.src}
            alt={listing.image.alt}
            sizes={compact ? "(min-width: 1024px) 25vw, 50vw" : "(min-width: 768px) 33vw, 100vw"}
            preload={rank === 1}
            className="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </div>
      </Link>
      <div className="flex flex-1 flex-col pt-4">
        <p className="text-xs text-muted">
          GIFTWALA listing · sample maker{" "}
          <Link href={routes.maker(listing.maker.slug)} className="underline-offset-4 hover:text-burgundy hover:underline">
            {listing.maker.name}
          </Link>
        </p>
        <h3 className={`mt-2 font-serif leading-snug ${compact ? "text-lg" : "text-2xl"}`}>
          <Link href={routes.product(listing.slug)} className="hover:text-burgundy">
            {listing.name}
          </Link>
        </h3>
        {!compact && <p className="mt-2 text-sm text-muted">{listing.reason}</p>}
        <p className="mt-3 text-[0.95rem] font-medium">{formatPrice(listing.price)}</p>
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
          {compact ? (
            <Link href={requestHref} className={textLink}>
              Add to cart <ArrowRightIcon width={15} height={15} />
            </Link>
          ) : (
            <Link href={requestHref} className={`${primaryPill} h-10`}>
              Add to cart <ArrowRightIcon width={15} height={15} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function IdeaView({ idea }: { idea: IdeaCard }) {
  return (
    <article className="flex h-full flex-col rounded-[1rem] border border-dashed border-terracotta/70 bg-white/50 p-5">
      <p className="text-xs text-muted">
        <span className="font-medium text-charcoal">Gift idea</span> · not a listing · {idea.category}
      </p>
      <h3 className="mt-2 font-serif text-xl leading-snug">{idea.title}</h3>
      <p className="mt-2 text-sm">{idea.summary}</p>
      <p className="mt-2 text-sm text-muted">{idea.reason}</p>
      {idea.check && (
        <p className="mt-3 rounded-lg bg-blush px-3 py-2 text-xs text-berry">
          <span className="font-medium">Worth checking:</span> {idea.check}
        </p>
      )}
      <details className="mt-auto pt-4 text-sm">
        <summary className="cursor-pointer text-muted underline decoration-linen underline-offset-4 hover:text-burgundy">
          What to check before buying
        </summary>
        <ul className="mt-2 space-y-1 text-muted">
          {idea.lookFor.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true" className="text-terracotta">—</span>
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted">Usually found at: {idea.whereToFind}</p>
      </details>
    </article>
  );
}

function LoadingCards() {
  return (
    <div>
      <p className="mb-8 text-sm text-muted">Reading your description and checking the catalogue…</p>
      <ul className="grid gap-x-8 gap-y-12 md:grid-cols-3" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <li key={i} className="animate-pulse">
            <div className="aspect-[4/3] rounded-[1rem] bg-linen md:aspect-[4/5]" />
            <div className="mt-4 h-3 w-1/3 rounded-full bg-linen" />
            <div className="mt-3 h-5 w-2/3 rounded-full bg-linen" />
          </li>
        ))}
      </ul>
    </div>
  );
}
