"use client";

import Form from "next/form";
import { useRef } from "react";
import { routes } from "@/lib/routes";
import { ArrowRightIcon } from "@/components/ui/icons";

const EXAMPLES = [
  { label: "Cricket fan who loves to travel", brief: "A 20-year-old who loves cricket, is adventurous and enjoys travelling" },
  { label: "Cat lover, K-drama fan", brief: "My friend turns 24 on Saturday, loves cats and K-dramas, ₹1,500, Andheri" },
  { label: "Foodie who hosts friends", brief: "My brother loves cheese, chocolate and hosting friends" },
];

/** The compact, one-line Gift Finder entry used in the homepage hero. */
export function HeroSearch() {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Form action={routes.giftFinder} className="mt-10 max-w-xl">
      <label htmlFor="hero-brief" className="sr-only">
        Describe who you&apos;re buying for
      </label>
      <div className="flex items-center gap-2 rounded-full border border-charcoal/15 bg-white p-1.5 pl-5 shadow-soft focus-within:border-burgundy">
        <input
          ref={inputRef}
          id="hero-brief"
          name="brief"
          required
          minLength={3}
          maxLength={600}
          placeholder="What do they love?"
          className="h-11 min-w-0 flex-1 bg-transparent text-[0.95rem] placeholder:text-muted/80 focus:outline-none"
        />
        <button
          type="submit"
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-burgundy px-5 text-sm font-medium text-white transition-colors hover:bg-burgundy-hover"
        >
          <span className="hidden sm:inline">Find their perfect gift</span>
          <span className="sm:hidden">Find</span>
          <ArrowRightIcon width={16} height={16} />
        </button>
      </div>

      <fieldset className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <legend className="sr-only">Show me</legend>
        <span className="mr-1 text-muted">Show me</span>
        {(
          [
            { id: "all", label: "Everything" },
            { id: "buy", label: "Things I can buy" },
            { id: "ideas", label: "Gift ideas" },
          ] as const
        ).map((option) => (
          <label
            key={option.id}
            className="cursor-pointer rounded-full border border-linen px-3 py-1 text-muted transition-colors has-[:checked]:border-charcoal has-[:checked]:text-charcoal has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-burgundy"
          >
            <input type="radio" name="view" value={option.id} defaultChecked={option.id === "all"} className="sr-only" />
            {option.label}
          </label>
        ))}
      </fieldset>

      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Try an example">
        {EXAMPLES.map((example) => (
          <button
            key={example.label}
            type="button"
            onClick={() => {
              if (!inputRef.current) return;
              inputRef.current.value = example.brief;
              inputRef.current.focus();
            }}
            className="text-muted underline decoration-linen underline-offset-4 hover:text-burgundy hover:decoration-burgundy"
          >
            {example.label}
          </button>
        ))}
      </div>
    </Form>
  );
}
