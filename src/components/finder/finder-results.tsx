"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import type { MatchCard, MatchRequest, MatchResponse } from "@/lib/finder/types";
import { routes } from "@/lib/routes";
import { ButtonLink } from "@/components/ui/button";
import { GiftImage } from "@/components/ui/gift-image";
import { PenIcon, SparkIcon } from "@/components/ui/icons";
import { DescribeBox } from "./describe-box";

type Refinement = "others" | "cheaper" | "handmade" | "unusual";

const REFINEMENTS: { id: Refinement; label: string; clause?: string }[] = [
  { id: "others", label: "Show other ideas" },
  { id: "cheaper", label: "Less expensive" },
  { id: "handmade", label: "More handmade", clause: "Prefer handmade, made-by-hand pieces." },
  { id: "unusual", label: "Something more unusual", clause: "Prefer something unusual and unexpected." },
];

type Result = { key: string } & ({ data: MatchResponse } | { error: string });

export function FinderResults() {
  const params = useSearchParams();
  const brief = params.get("brief")?.trim() ?? "";
  // A new description starts a fresh session (no carried-over refinements)
  return <FinderSession key={brief} brief={brief} />;
}

function FinderSession({ brief }: { brief: string }) {
  // Refinements keep the original description and add to it
  const [refine, setRefine] = useState<{ clauses: string[]; exclude: string[]; budgetMax?: number }>({
    clauses: [],
    exclude: [],
  });
  const [result, setResult] = useState<Result>();
  const [editing, setEditing] = useState(false);

  const request: MatchRequest = useMemo(
    () => ({
      brief: [brief, ...refine.clauses].join(" "),
      exclude: refine.exclude,
      budgetMax: refine.budgetMax,
    }),
    [brief, refine],
  );
  const key = JSON.stringify(request);

  useEffect(() => {
    if (!brief) return;
    const controller = new AbortController();
    fetch("/api/match", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: key,
      signal: controller.signal,
    })
      .then(async (res) => {
        const json = await res.json();
        setResult(res.ok ? { key, data: json } : { key, error: json.error ?? "Something went wrong." });
      })
      .catch((error) => {
        if (error.name !== "AbortError") setResult({ key, error: "We couldn't reach the Gift Finder. Try again." });
      });
    return () => controller.abort();
  }, [brief, key]);

  if (!brief || editing) {
    return (
      <div className="max-w-2xl">
        <DescribeBox defaultValue={brief} size="lg" />
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
  const error = !loading && result && "error" in result ? result.error : undefined;

  const applyRefinement = (r: Refinement) => {
    if (!data) return;
    const shown = data.matches.map((m) => m.id);
    setRefine((prev) => {
      const next = { ...prev, exclude: [...prev.exclude, ...shown] };
      const option = REFINEMENTS.find((x) => x.id === r);
      if (option?.clause && !prev.clauses.includes(option.clause)) next.clauses = [...prev.clauses, option.clause];
      if (r === "cheaper" && data.matches.length) {
        next.budgetMax = Math.round(Math.min(...data.matches.map((m) => m.price)) * 0.95);
        next.exclude = prev.exclude;
      }
      return next;
    });
  };

  return (
    <div>
      {/* The brief and what we understood from it */}
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
            <PenIcon width={16} height={16} /> Edit description
          </button>
        </div>
        {data && <Understood data={data} />}
      </section>

      <div aria-live="polite" className="mt-10">
        {loading && <LoadingCards />}
        {error && (
          <p role="alert" className="rounded-md border border-berry/30 bg-blush px-4 py-3 text-sm text-berry">
            {error}
          </p>
        )}
        {data && data.matches.length === 0 && <NoMatches data={data} />}
        {data && data.matches.length > 0 && (
          <>
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="font-serif text-3xl tracking-tight">
                {data.matches.length === 1 ? "One gift that fits" : `${data.matches.length} gifts that fit`}
              </h2>
              <p className="inline-flex items-center gap-1.5 text-xs text-muted">
                <SparkIcon width={14} height={14} />
                {data.mode === "ai"
                  ? `Picked and explained by ${data.provider ?? "AI"} from eligible gifts`
                  : "Picked by keyword matching"}
              </p>
            </div>
            <ul className="grid gap-8 md:grid-cols-3">
              {data.matches.map((match, i) => (
                <li key={match.id}>
                  <MatchCardView match={match} rank={i + 1} requestHref={requestHref(match, data)} />
                </li>
              ))}
            </ul>
            {data.modeNote && <p className="mt-6 text-sm text-muted">{data.modeNote}</p>}
            {data.excludedNote && <p className="mt-2 text-sm text-muted">{data.excludedNote}</p>}

            <div className="mt-10 border-t border-linen pt-6">
              <p className="mb-3 text-sm font-medium">Not quite right?</p>
              <div className="flex flex-wrap gap-2">
                {REFINEMENTS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => applyRefinement(r.id)}
                    disabled={r.id === "others" && data.remaining === 0}
                    className="rounded-full border border-charcoal/20 bg-white px-4 py-2 text-sm transition-colors hover:border-burgundy hover:text-burgundy disabled:opacity-50"
                  >
                    {r.label}
                  </button>
                ))}
                {(refine.clauses.length > 0 || refine.exclude.length > 0 || refine.budgetMax) && (
                  <button
                    type="button"
                    onClick={() => setRefine({ clauses: [], exclude: [] })}
                    className="px-2 py-2 text-sm text-muted underline-offset-4 hover:underline"
                  >
                    Start over
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Understood({ data }: { data: MatchResponse }) {
  const u = data.understood;
  const chips = [
    u.recipient && `For: ${u.recipient}`,
    u.occasion && `Occasion: ${u.occasion}`,
    u.budgetMax !== undefined && `Up to ${formatPrice(u.budgetMax)}`,
    u.date && `Arrives by ${u.date.label}`,
    u.area && `${u.area.name} · ${u.area.zone}`,
    ...u.interests,
  ].filter(Boolean) as string[];
  const missing = [!u.budgetMax && "a budget", !u.date && "a date", !u.area && "a Mumbai area"].filter(
    Boolean,
  ) as string[];

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
      {missing.length > 0 && (
        <p className="mt-3 text-xs text-muted">
          Add {missing.join(", ").replace(/, ([^,]*)$/, " and $1")} to check price, timing and delivery.
        </p>
      )}
    </div>
  );
}

/** The request form opens pre-filled with the date and area from the brief. */
function requestHref(match: MatchCard, data: MatchResponse): string {
  const q = new URLSearchParams();
  if (data.understood.date) q.set("date", data.understood.date.iso);
  if (data.understood.area) q.set("area", data.understood.area.name);
  const query = q.toString();
  return routes.requestGift(match.slug) + (query ? `?${query}` : "");
}

function MatchCardView({ match, rank, requestHref }: { match: MatchCard; rank: number; requestHref: string }) {
  return (
    <article className="flex h-full flex-col">
      <Link href={routes.product(match.slug)} className="group block">
        <div className="relative aspect-[4/3] md:aspect-[4/5] overflow-hidden rounded-md bg-linen">
          <GiftImage
            src={match.image.src}
            alt={match.image.alt}
            sizes="(min-width: 768px) 33vw, 100vw"
            preload={rank === 1}
            className="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </div>
      </Link>
      <div className="flex flex-1 flex-col pt-4">
        <Link
          href={routes.maker(match.maker.slug)}
          className="self-start text-xs tracking-wide text-muted uppercase hover:text-burgundy"
        >
          {match.maker.name} · {match.maker.location.replace(", Mumbai", "")}
        </Link>
        <h3 className="mt-1.5 font-serif text-xl leading-snug">
          <Link href={routes.product(match.slug)} className="hover:text-burgundy">
            {match.name}
          </Link>
        </h3>
        <p className="mt-2 text-sm">{match.reason}</p>
        <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <div className="flex gap-1">
            <dt className="sr-only">Price</dt>
            <dd className="font-semibold">{formatPrice(match.price)}</dd>
          </div>
          <div className="flex gap-1 text-sage">
            <dt>Can arrive by</dt>
            <dd className="font-medium">{match.arrivalLabel}</dd>
          </div>
        </dl>
        {match.personalisable && (
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

function LoadingCards() {
  return (
    <div>
      <p className="mb-6 text-sm text-muted">Reading your description and checking what can arrive in time…</p>
      <ul className="grid gap-8 md:grid-cols-3" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <li key={i} className="animate-pulse">
            <div className="aspect-[4/5] rounded-md bg-linen" />
            <div className="mt-4 h-3 w-1/3 rounded bg-linen" />
            <div className="mt-3 h-5 w-2/3 rounded bg-linen" />
            <div className="mt-3 h-3 w-full rounded bg-linen" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function NoMatches({ data }: { data: MatchResponse }) {
  return (
    <div className="rounded-lg border border-linen bg-white p-6">
      <h2 className="font-serif text-2xl">Nothing fits all of that yet</h2>
      <p className="mt-2 text-sm text-muted">
        {data.excludedNote ?? "No gifts matched."} Try a later date, a higher budget or a nearby area.
      </p>
      <ButtonLink href={routes.gifts} variant="secondary" className="mt-5">
        Browse all gifts
      </ButtonLink>
    </div>
  );
}
