import { configuredProvider } from "@/lib/finder/ai";
import { todayInIndia } from "@/lib/finder/dates";
import { findGifts } from "@/lib/finder/engine";
import type { MatchRequest, Preference } from "@/lib/finder/types";

const MAX_BRIEF = 600;
const PREFERENCES: Preference[] = ["practical", "unusual", "experiences", "handmade"];

/** POST /api/match — runs the Gift Finder pipeline (see lib/finder/engine.ts). */
export async function POST(request: Request) {
  let body: Partial<MatchRequest>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const brief = typeof body.brief === "string" ? body.brief.trim().slice(0, MAX_BRIEF) : "";
  if (!brief) {
    return Response.json({ error: "Tell us a little about who the gift is for." }, { status: 400 });
  }

  const result = await findGifts(
    {
      brief,
      exclude: Array.isArray(body.exclude) ? body.exclude.filter((x): x is string => typeof x === "string") : [],
      budgetMax: typeof body.budgetMax === "number" ? body.budgetMax : undefined,
      mode: body.mode === "rules" ? "rules" : "auto",
      prefer: PREFERENCES.find((p) => p === body.prefer),
    },
    { today: todayInIndia(), ai: configuredProvider() },
  );
  return Response.json(result);
}
