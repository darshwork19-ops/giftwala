/** Shapes shared by the /api/match route and the Gift Finder page. */

export interface MatchRequest {
  brief: string;
  /** Product ids already shown, so "show other ideas" returns new ones. */
  exclude?: string[];
  /** Overrides the budget read from the brief (used by "less expensive"). */
  budgetMax?: number;
}

export interface MatchCard {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: { src: string; alt: string };
  maker: { name: string; slug: string; location: string };
  arrival: string;
  arrivalLabel: string;
  reason: string;
  personalisable: boolean;
}

export interface MatchResponse {
  /** "ai" when a model ranked and explained; "rules" for the keyword fallback. */
  mode: "ai" | "rules";
  /** Which AI provider made the picks, when mode is "ai". */
  provider?: "Gemini" | "Claude";
  modeNote?: string;
  understood: {
    summary?: string;
    budgetMax?: number;
    date?: { iso: string; label: string };
    area?: { name: string; zone: string };
    recipient?: string;
    occasion?: string;
    interests: string[];
  };
  matches: MatchCard[];
  excludedNote?: string;
  /** Eligible gifts not shown yet. */
  remaining: number;
}
