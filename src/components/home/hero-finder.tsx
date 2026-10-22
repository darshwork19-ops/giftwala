"use client";

import { useState } from "react";
import { GiftQuiz } from "@/components/finder/gift-quiz";
import { HeroSearch } from "./hero-search";

/** The guided picker by default; typing a description is an opt-in alternative. */
export function HeroFinder() {
  const [typing, setTyping] = useState(false);
  if (typing) {
    return (
      <div>
        <HeroSearch />
        <button type="button" onClick={() => setTyping(false)}
          className="mt-4 text-xs text-muted underline underline-offset-4 hover:text-burgundy">
          ← Back to picking options
        </button>
      </div>
    );
  }
  return (
    <div className="mt-10 max-w-xl">
      <GiftQuiz variant="hero" onTypeInstead={() => setTyping(true)} />
    </div>
  );
}
