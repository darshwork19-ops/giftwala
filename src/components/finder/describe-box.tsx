"use client";

import Form from "next/form";
import { useId, useRef } from "react";
import { routes } from "@/lib/routes";
import { ArrowRightIcon, SparkIcon } from "@/components/ui/icons";

const EXAMPLES = [
  "My friend turns 24 on Saturday, loves cats and K-dramas, ₹1,500, Andheri",
  "A 20-year-old who loves cricket, is adventurous and enjoys travelling",
  "My sister is studying for CA Final, loves badminton and cars",
];

interface DescribeBoxProps {
  defaultValue?: string;
  /** Visual size: the homepage hero uses "lg". */
  size?: "md" | "lg";
}

/**
 * The first step of the Gift Finder: one free-text description. Submits to
 * /gift-finder?brief=… so results can be shared, refreshed and revisited.
 */
export function DescribeBox({ defaultValue = "", size = "md" }: DescribeBoxProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hintId = useId();

  const fillExample = (text: string) => {
    if (!textareaRef.current) return;
    textareaRef.current.value = text;
    textareaRef.current.focus();
  };

  return (
    <Form
      action={routes.giftFinder}
      className="rounded-lg border border-linen bg-white p-4 shadow-soft sm:p-5"
    >
      <label htmlFor="brief" className="flex items-center gap-2 font-serif text-lg">
        <SparkIcon className="text-burgundy" />
        Who are you buying for?
      </label>
      <p id={hintId} className="mt-1 text-sm text-muted">
        What they love, their hobbies and personality. Add a budget, a date and a
        Mumbai area or PIN if you want delivery checked.
      </p>
      <textarea
        ref={textareaRef}
        id="brief"
        name="brief"
        required
        minLength={3}
        maxLength={600}
        rows={size === "lg" ? 3 : 2}
        defaultValue={defaultValue}
        aria-describedby={hintId}
        placeholder={EXAMPLES[0]}
        className="mt-3 w-full resize-none rounded-md border border-linen bg-ivory/40 px-3 py-2.5 text-[0.95rem] leading-relaxed placeholder:text-muted/70 focus:border-burgundy focus:bg-white"
      />
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" aria-label="Example descriptions">
          {EXAMPLES.slice(1).map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => fillExample(example)}
              className="rounded-full border border-linen px-3 py-1 text-left text-xs text-muted transition-colors hover:border-burgundy hover:text-burgundy"
            >
              {example.split(",")[0]}
            </button>
          ))}
        </div>
        <button
          type="submit"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-burgundy px-5 text-sm font-medium text-white transition-colors hover:bg-burgundy-hover"
        >
          Find their perfect gift
          <ArrowRightIcon width={16} height={16} />
        </button>
      </div>
    </Form>
  );
}
