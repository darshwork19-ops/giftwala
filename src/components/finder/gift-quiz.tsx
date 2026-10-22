"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState, useSyncExternalStore } from "react";
import { allAreaNames } from "@/lib/finder/areas";
import { addDays, todayInIndia } from "@/lib/finder/dates";
import {
  answerLabels,
  BUDGETS,
  composeBrief,
  emptyAnswers,
  INTEREST_GROUPS,
  MAX_INTERESTS,
  OCCASIONS,
  RECIPIENTS,
  STYLES,
  WHEN,
  type QuizAnswers,
} from "@/lib/finder/quiz";
import { routes } from "@/lib/routes";
import { ArrowRightIcon } from "@/components/ui/icons";

const STEPS = ["Who", "Occasion", "Interests", "Style", "Budget", "When"] as const;
const QUESTIONS = [
  "Who are you shopping for?",
  "What's the occasion?",
  "What are they into?",
  "Any particular feel?",
  "What's your budget?",
  "When and where should it arrive?",
];
const HINTS = [
  "",
  "",
  `Pick up to ${MAX_INTERESTS}.`,
  "Optional. Pick any that fit.",
  "",
  "Optional, but it lets us check delivery.",
];

const noopSubscribe = () => () => {};

const chip =
  "rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-burgundy aria-pressed:border-burgundy aria-pressed:bg-burgundy aria-pressed:text-white border-charcoal/15 bg-white hover:border-burgundy hover:text-burgundy disabled:opacity-40 disabled:hover:border-charcoal/15 disabled:hover:text-charcoal";

interface GiftQuizProps {
  /** "hero" sits in the homepage hero; "page" is the Gift Finder page. */
  variant?: "hero" | "page";
  /** Shown as a quiet link: switch to describing them in their own words. */
  onTypeInstead?: () => void;
}

/** The guided Gift Finder: tap through six short questions instead of typing. */
export function GiftQuiz({ variant = "page", onTypeInstead }: GiftQuizProps) {
  const router = useRouter();
  const headingId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  // "Today" differs between build time and the visitor's day, so read it on the client only
  const today = useSyncExternalStore(noopSubscribe, () => todayInIndia(), () => null);
  const [step, setStep] = useState(0);
  const [a, setA] = useState<QuizAnswers>(emptyAnswers);
  const [finding, setFinding] = useState(false);

  const go = (next: number) => {
    setStep(next);
    // Keep the question in view and move focus to it for keyboard and screen-reader users
    requestAnimationFrame(() => panelRef.current?.focus({ preventScroll: true }));
  };
  // Single-choice answers move on by themselves, after a beat so the tap registers
  const pickAndNext = (patch: Partial<QuizAnswers>) => {
    setA((v) => ({ ...v, ...patch }));
    setTimeout(() => go(Math.min(step + 1, STEPS.length - 1)), 180);
  };
  const toggle = (key: "interests" | "styles", id: string, max = Infinity) =>
    setA((v) => {
      const list = v[key];
      if (list.includes(id)) return { ...v, [key]: list.filter((x) => x !== id) };
      return list.length >= max ? v : { ...v, [key]: [...list, id] };
    });

  const finish = () => {
    if (!today) return;
    setFinding(true);
    router.push(routes.giftFinderFor(composeBrief(a, today), a.view));
  };

  const picks = answerLabels(a);
  const big = variant === "page";

  return (
    <section
      aria-labelledby={headingId}
      className={`rounded-[1.5rem] border border-charcoal/10 bg-white shadow-soft ${big ? "p-6 sm:p-8" : "p-5 sm:p-6"}`}
    >
      {/* Progress */}
      <div className="flex items-center justify-between gap-4 text-xs text-muted">
        <span>
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </span>
        {step > 0 && (
          <button type="button" onClick={() => go(step - 1)} className="underline decoration-linen underline-offset-4 hover:text-burgundy">
            ← Back
          </button>
        )}
      </div>
      <div className="mt-2 flex gap-1" aria-hidden="true">
        {STEPS.map((s, i) => (
          <span key={s} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-burgundy" : "bg-linen"}`} />
        ))}
      </div>

      <div ref={panelRef} tabIndex={-1} className="mt-5 focus:outline-none">
        <h2 id={headingId} className={`font-serif leading-tight ${big ? "text-3xl" : "text-2xl"}`}>
          {QUESTIONS[step]}
        </h2>
        {HINTS[step] && <p className="mt-1 text-sm text-muted">{HINTS[step]}</p>}

        <div className="mt-5">
          {step === 0 && (
            <ChipGroup label="Recipient">
              {RECIPIENTS.map((c) => (
                <button key={c.id} type="button" aria-pressed={a.recipient === c.id} onClick={() => pickAndNext({ recipient: c.id })} className={chip}>
                  {c.label}
                </button>
              ))}
              <button type="button" aria-pressed={false} onClick={() => pickAndNext({ recipient: undefined })} className={chip}>
                Someone else
              </button>
            </ChipGroup>
          )}

          {step === 1 && (
            <ChipGroup label="Occasion">
              {OCCASIONS.map((c) => (
                <button key={c.id} type="button" aria-pressed={a.occasion === c.id} onClick={() => pickAndNext({ occasion: c.id })} className={chip}>
                  {c.label}
                </button>
              ))}
            </ChipGroup>
          )}

          {step === 2 && (
            <div className={`space-y-4 ${big ? "" : "max-h-72 overflow-y-auto pr-1"}`}>
              {INTEREST_GROUPS.map((g) => (
                <div key={g.label}>
                  <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">{g.label}</p>
                  <ChipGroup label={g.label}>
                    {g.choices.map((c) => {
                      const on = a.interests.includes(c.id);
                      return (
                        <button key={c.id} type="button" aria-pressed={on} disabled={!on && a.interests.length >= MAX_INTERESTS}
                          onClick={() => toggle("interests", c.id, MAX_INTERESTS)} className={chip}>
                          {c.label}
                        </button>
                      );
                    })}
                  </ChipGroup>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <ChipGroup label="Style">
              {STYLES.map((c) => (
                <button key={c.id} type="button" aria-pressed={a.styles.includes(c.id)} onClick={() => toggle("styles", c.id)} className={chip}>
                  {c.label}
                </button>
              ))}
            </ChipGroup>
          )}

          {step === 4 && (
            <ChipGroup label="Budget">
              {BUDGETS.map((c) => (
                <button key={c.id} type="button" aria-pressed={a.budget === c.id} onClick={() => pickAndNext({ budget: c.id })} className={chip}>
                  {c.label}
                </button>
              ))}
            </ChipGroup>
          )}

          {step === 5 && (
            <div className="space-y-5">
              <ChipGroup label="When">
                {WHEN.map((c) => (
                  <button key={c.id} type="button" aria-pressed={a.when === c.id} onClick={() => setA((v) => ({ ...v, when: c.id }))} className={chip}>
                    {c.label}
                  </button>
                ))}
              </ChipGroup>
              {a.when === "date" && today && (
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium">Arrive by</span>
                  <input type="date" min={addDays(today, 1)} value={a.date ?? ""} onChange={(e) => setA((v) => ({ ...v, date: e.target.value }))}
                    className="h-11 rounded-xl border border-charcoal/15 bg-white px-4 focus:border-burgundy focus:outline-none" />
                </label>
              )}
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium">Deliver to (Mumbai area)</span>
                <select value={a.area} onChange={(e) => setA((v) => ({ ...v, area: e.target.value }))}
                  className="h-11 w-full max-w-xs rounded-xl border border-charcoal/15 bg-white px-4 focus:border-burgundy focus:outline-none">
                  <option value="">Not sure yet</option>
                  {allAreaNames.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <fieldset>
                <legend className="mb-2 text-sm font-medium">Show me</legend>
                <div className="flex flex-wrap gap-2">
                  {([["buy", "Things I can buy"], ["ideas", "Gift ideas"]] as const).map(([id, label]) => (
                    <button key={id} type="button" aria-pressed={a.view === id} onClick={() => setA((v) => ({ ...v, view: id }))} className={chip}>
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          )}
        </div>
      </div>

      {/* Picks so far: tap one to change it */}
      {picks.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-1.5 border-t border-linen pt-4" aria-label="Your picks so far">
          {picks.map((p) => (
            <li key={p.label}>
              <button type="button" onClick={() => go(p.step)} className="rounded-full bg-blush px-3 py-1 text-xs text-burgundy hover:underline">
                {p.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        {step < STEPS.length - 1 ? (
          <>
            {!(step === 2 && a.interests.length > 0) ? (
              <button type="button" onClick={() => go(step + 1)} className="text-sm text-muted underline decoration-linen underline-offset-4 hover:text-burgundy">
                {step === 2 ? "Skip — not sure" : "Skip"}
              </button>
            ) : (
              <span />
            )}
            {(step === 2 || step === 3) && (
              <button type="button" onClick={() => go(step + 1)}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-burgundy px-5 text-sm font-medium text-white transition-colors hover:bg-burgundy-hover">
                Next <ArrowRightIcon width={16} height={16} />
              </button>
            )}
          </>
        ) : (
          <button type="button" onClick={finish} disabled={finding || !today || (a.when === "date" && !a.date)}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-burgundy px-6 text-sm font-medium text-white transition-colors hover:bg-burgundy-hover disabled:opacity-60 sm:w-auto">
            {finding ? "Finding gifts…" : "Find their perfect gift"} <ArrowRightIcon width={16} height={16} />
          </button>
        )}
      </div>

      {onTypeInstead && (
        <p className="mt-4 text-xs text-muted">
          Prefer to describe them yourself?{" "}
          <button type="button" onClick={onTypeInstead} className="underline underline-offset-4 hover:text-burgundy">
            Write it in your own words
          </button>
        </p>
      )}
    </section>
  );
}

function ChipGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {children}
    </div>
  );
}
