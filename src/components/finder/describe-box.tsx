"use client";

import Form from "next/form";
import { useId, useRef } from "react";
import { routes } from "@/lib/routes";
import { ArrowRightIcon } from "@/components/ui/icons";

const EXAMPLES = [
  { label: "Cat lover, K-drama fan", brief: "My friend turns 24 on Saturday, loves cats and K-dramas, ₹1,500, Andheri" },
  { label: "Cricket fan who loves to travel", brief: "A 20-year-old who loves cricket, is adventurous and enjoys travelling" },
  { label: "Studying for CA, loves badminton", brief: "My sister is studying for CA Final, loves badminton and cars" },
];

export type FinderView = "buy" | "ideas";

interface DescribeBoxProps {
  defaultValue?: string;
  defaultView?: FinderView;
}

/**
 * The first step of the Gift Finder: one free-text description. Submits to
 * /gift-finder?brief=… so results can be shared, refreshed and revisited.
 */
export function DescribeBox({ defaultValue = "", defaultView = "buy" }: DescribeBoxProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hintId = useId();

  return (
    <Form action={routes.giftFinder} className="max-w-2xl">
      <label htmlFor="brief" className="font-serif text-2xl">
        Who are you buying for?
      </label>
      <p id={hintId} className="mt-1 text-sm text-muted">
        What they love, their hobbies and personality. Add a budget, a date and a Mumbai area or PIN if you want
        delivery checked.
      </p>
      <div className="mt-4 rounded-[1.25rem] border border-charcoal/15 bg-white p-2 shadow-soft focus-within:border-burgundy">
        <textarea
          ref={textareaRef}
          id="brief"
          name="brief"
          required
          minLength={3}
          maxLength={600}
          rows={3}
          defaultValue={defaultValue}
          aria-describedby={hintId}
          placeholder="What do they love?"
          className="block w-full resize-none bg-transparent px-3 py-2 text-[0.95rem] leading-relaxed placeholder:text-muted/80 focus:outline-none"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-burgundy px-5 text-sm font-medium text-white transition-colors hover:bg-burgundy-hover"
          >
            Find their perfect gift
            <ArrowRightIcon width={16} height={16} />
          </button>
        </div>
      </div>

      <fieldset className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <legend className="sr-only">Show me</legend>
        <span className="mr-1 text-muted">Show me</span>
        {(
          [
            { id: "buy", label: "Things I can buy" },
            { id: "ideas", label: "Gift ideas" },
          ] as const
        ).map((option) => (
          <label
            key={option.id}
            className="cursor-pointer rounded-full border border-linen px-3 py-1 text-muted transition-colors has-[:checked]:border-charcoal has-[:checked]:text-charcoal has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-burgundy"
          >
            <input type="radio" name="view" value={option.id} defaultChecked={defaultView === option.id} className="sr-only" />
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
              if (!textareaRef.current) return;
              textareaRef.current.value = example.brief;
              textareaRef.current.focus();
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
