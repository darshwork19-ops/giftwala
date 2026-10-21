import { describe, expect, it } from "vitest";
import { getAllProducts } from "@/lib/catalogue";
import { searchGifts } from "@/lib/search";
import { INTERESTS } from "@/components/home/interest-grid";
import { AiOutputError, type AiProvider } from "./ai-types";
import { findPin, findDestination } from "./destination";
import { findGifts, MESSAGES } from "./engine";
import { classifyIntent } from "./intent";
import { parseBrief } from "./parse";
import { IntentCheckSchema, RankingSchema } from "./ranker";

// A fixed Wednesday so lead-time maths is stable
const TODAY = "2026-10-21";
const run = (brief: string, ai?: AiProvider, extra = {}) => findGifts({ brief, ...extra }, { today: TODAY, ai });

/** A fake AI that answers the ranking prompt with a function of the candidate ids. */
function fakeAi(pick: (ids: string[]) => { productId: string; reason: string }[]): AiProvider {
  return {
    name: "Gemini",
    async generateJson({ prompt, schema }) {
      if (schema === (IntentCheckSchema as unknown)) return schema.parse({ kind: "gift_request" });
      const ids = [...prompt.matchAll(/"id":"(p-\d+)"/g)].map((m) => m[1]);
      return schema.parse({ summary: "A test recipient", interests: [], picks: pick(ids) });
    },
  };
}
const failingAi = (error: Error): AiProvider => ({
  name: "Gemini",
  async generateJson() {
    throw error;
  },
});

describe("required Gift Finder cases", () => {
  it("1. 'bsibcisbc' returns zero recommendations and a validation state", async () => {
    const r = await run("bsibcisbc");
    expect(r.status).toBe("nonsense");
    expect(r.message).toBe(MESSAGES.nonsense);
    expect(r.listings).toHaveLength(0);
    expect(r.ideas).toHaveLength(0);
  });

  it("1b. nonsense stays nonsense even with AI configured", async () => {
    const ai = fakeAi((ids) => ids.slice(0, 3).map((productId) => ({ productId, reason: "x" })));
    const r = await run("bsibcisbc", ai);
    expect(r.status).toBe("nonsense");
    expect(r.listings).toHaveLength(0);
  });

  it("2. 'asdfgh 123 xyz' returns zero recommendations", async () => {
    const r = await run("asdfgh 123 xyz");
    expect(r.status).toBe("nonsense");
    expect(r.listings).toHaveLength(0);
    expect(r.ideas).toHaveLength(0);
  });

  it("3. an unrelated question gets a scope message and no gifts", async () => {
    const r = await run("What is the capital of France?");
    expect(r.status).toBe("off_topic");
    expect(r.message).toBe(MESSAGES.off_topic);
    expect(r.listings).toHaveLength(0);
    expect(r.ideas).toHaveLength(0);
  });

  it("4. 'I need a gift for my sister' asks a follow-up, shows nothing", async () => {
    const r = await run("I need a gift for my sister");
    expect(r.status).toBe("follow_up");
    expect(r.followUp?.question).toBeTruthy();
    expect(r.listings).toHaveLength(0);
  });

  it("5. 'cricket bat' is valid intent: no fake listing, a labelled idea instead", async () => {
    const r = await run("cricket bat");
    expect(["results", "no_match"]).toContain(r.status);
    expect(r.listings).toHaveLength(0); // the demo catalogue has no cricket gear
    expect(r.ideas.map((i) => i.id)).toContain("cricket-bat");
    expect(r.ideas.every((i) => i.kind === "idea")).toBe(true);
  });

  it("6. cricket-loving friend under ₹1,500: only relevant items within budget", async () => {
    const r = await run("A birthday gift for my cricket-loving friend under ₹1,500");
    expect(r.understood.budgetMax).toBe(1500);
    expect(r.listings.every((l) => l.price <= 1500)).toBe(true);
    // No chocolates, mugs or plants just because they're under budget
    expect(r.listings).toHaveLength(0);
    expect(r.ideas.length).toBeGreaterThan(0);
  });

  it("7. an absent category returns zero results and a refinement message", async () => {
    const r = await run("An astronomy-themed handmade gift under ₹500");
    expect(r.status).toBe("no_match");
    expect(r.listings).toHaveLength(0);
    expect(r.ideas).toHaveLength(0);
    expect(r.message).toMatch(/astronomy/);
  });

  describe("8. AI failures never become generic recommendations", () => {
    const brief = "GF turns 24, loves cats and K-dramas, ₹1,500";
    it.each([
      ["timeout", new DOMException("The operation was aborted due to timeout", "TimeoutError")],
      ["malformed output", new AiOutputError("Gemini returned malformed JSON")],
      ["empty response", new AiOutputError("Gemini returned an empty response")],
      ["API error", new Error("503 UNAVAILABLE")],
    ])("%s → error state, no products", async (_label, error) => {
      const r = await run(brief, failingAi(error as Error));
      expect(r.status).toBe("ai_error");
      expect(r.message).toBe(MESSAGES.ai_error);
      expect(r.listings).toHaveLength(0);
      expect(r.ideas).toHaveLength(0);
    });

    it("ids the AI invents are dropped", async () => {
      const r = await run(brief, fakeAi(() => [{ productId: "p-999", reason: "Made up" }]));
      expect(r.listings).toHaveLength(0);
      expect(r.status).toBe("no_match");
    });

    it("the AI may return fewer picks than candidates; nothing is padded", async () => {
      const r = await run(brief, fakeAi((ids) => [{ productId: ids[0], reason: "Fits" }]));
      expect(r.listings).toHaveLength(1);
      expect(r.mode).toBe("ai");
    });

    it("keyword matches are only shown when explicitly requested after an error", async () => {
      const r = await run(brief, failingAi(new Error("down")), { mode: "rules" });
      expect(r.status).toBe("results");
      expect(r.mode).toBe("rules");
      expect(r.listings.length).toBeGreaterThan(0);
    });
  });

  describe("9. delivery is never claimed without supporting data", () => {
    it("a destination outside the sample service area excludes catalogue gifts", async () => {
      const r = await run("a candle for my friend in Delhi");
      expect(r.listings).toHaveLength(0);
      expect(r.deliveryNote).toMatch(/only deliver within/);
    });

    it("gifts that can't be ready by the date are excluded", async () => {
      const r = await run("a candle for my friend, Andheri, tomorrow");
      for (const l of r.listings) expect(l.arrival <= "2026-10-22").toBe(true);
      expect(r.excludedNote).toMatch(/can't be ready/);
    });

    it("no listing is 'estimated' without both a destination and a date", async () => {
      for (const brief of ["a candle for my friend", "a candle for my friend in Andheri", "a candle by Saturday"]) {
        const r = await run(brief);
        expect(r.listings.every((l) => l.delivery.status === "not_verified")).toBe(true);
      }
    });

    it("a Mumbai PIN only counts as served for makers covering every zone", async () => {
      const r = await run("a candle for my friend, 400053, by next Friday");
      const saanjh = r.listings.filter((l) => l.maker.name === "Saanjh Candle Co.");
      expect(saanjh.length).toBeGreaterThan(0);
      expect(saanjh.every((l) => l.delivery.status === "not_verified")).toBe(true);
    });

    it("a time-slot request is flagged as not bookable", async () => {
      const r = await run("a candle for my friend in Bandra by Saturday 6pm");
      expect(r.deliveryNote).toMatch(/can't book or confirm delivery time slots/);
    });
  });

  it("10. a valid matching query still works, and the count is honest", async () => {
    const r = await run("GF turns 24 on Saturday, loves cats and K-dramas, ₹1,500, Andheri");
    expect(r.status).toBe("results");
    const names = r.listings.map((l) => l.name);
    expect(names).toContain("Black Cat Mug Pair");
    expect(names).toContain("K-Drama Night-In Box");
    expect(r.listings.every((l) => l.price <= 1500)).toBe(true);
    expect(r.listings.every((l) => l.delivery.status === "estimated")).toBe(true);
    expect(r.listings.every((l) => !/“dramas”/.test(l.reason))).toBe(true);
    // Every listing is a real catalogue record
    const ids = new Set(getAllProducts().map((p) => p.id));
    expect(r.listings.every((l) => ids.has(l.id))).toBe(true);
  });

  it("11. 'Explore all gifts' browses the catalogue; a failed query never shows everything", () => {
    expect(searchGifts({}).products).toHaveLength(getAllProducts().length);
    expect(searchGifts({ q: "bsibcisbc" }).products).toHaveLength(0);
  });
});

describe("recipient-first, cross-category examples", () => {
  it("Example A: cricket, sports, adventure, travel → ideas across those interests", async () => {
    const r = await run("A 20-year-old who loves cricket, plays sports, is adventurous and enjoys travelling");
    const ids = r.ideas.map((i) => i.id);
    expect(ids).toContain("cricket-bat");
    expect(ids).toContain("travel-organisers");
    expect(ids.some((id) => id === "trekking-backpack" || id === "adventure-experience")).toBe(true);
    expect(r.listings).toHaveLength(0);
  });

  it("Example B: CA Final, badminton, cars → racket, car collectible, study setup; no stereotypes", async () => {
    const r = await run("My sister is studying for CA Final, loves badminton and is enthusiastic about cars");
    const ids = r.ideas.map((i) => i.id);
    expect(ids).toContain("badminton-racket");
    expect(ids).toContain("car-model");
    expect(r.listings.some((l) => /earring|bracelet|scarf/i.test(l.name))).toBe(false);
  });
});

describe("homepage interest tiles", () => {
  it.each(INTERESTS.map((i) => [i.label, i.brief]))("%s leads to real results", async (_label, brief) => {
    const r = await run(brief);
    expect(r.status).toBe("results");
    expect(r.listings.length + r.ideas.length).toBeGreaterThan(0);
  });
});

describe("intent", () => {
  it("does not reject valid short queries", () => {
    for (const q of ["cricket bat", "candle", "pottery", "books"]) {
      expect(classifyIntent(q, parseBrief(q, TODAY)).kind).toBe("request");
    }
  });

  it("marks unfamiliar real words as uncertain so AI can check them", () => {
    const i = classifyIntent("telescope", parseBrief("telescope", TODAY));
    expect(i.kind).toBe("nonsense");
    expect(i.uncertain).toBe(true);
    const j = classifyIntent("bsibcisbc", parseBrief("bsibcisbc", TODAY));
    expect(j.uncertain).toBe(false);
  });

  it("an AI intent check can turn 'telescope' into an honest no-match", async () => {
    const r = await run("telescope", fakeAi(() => []));
    expect(r.status).toBe("no_match");
    expect(r.listings).toHaveLength(0);
  });

  it("a failed AI intent check stays safe (nonsense, no products)", async () => {
    const r = await run("telescope", failingAi(new Error("timeout")));
    expect(r.status).toBe("nonsense");
    expect(r.listings).toHaveLength(0);
  });
});

describe("parsing", () => {
  it("reads budget, date and area", () => {
    const f = parseBrief("GF turns 24 on Saturday, ₹1,500, Andheri", TODAY);
    expect(f.budgetMax).toBe(1500);
    expect(f.date?.iso).toBe("2026-10-24");
    expect(f.destination?.kind).toBe("zone");
    expect(f.age).toBe(24);
  });

  it("treats 'handmade' as a modifier, not a subject", () => {
    const f = parseBrief("a handmade gift", TODAY);
    expect(f.keywords).not.toContain("handmade");
    expect(f.modifiers).toContain("handmade");
  });

  it("finds PIN codes but not amounts", () => {
    expect(findPin("deliver to 400053 please")).toBe("400053");
    expect(findPin("budget ₹400000")).toBeUndefined();
    expect(findPin("under 250000")).toBeUndefined();
    expect(findDestination("send to 110001")?.kind).toBe("outside");
    expect(findDestination("send to 400601")?.kind).toBe("region");
  });

  it("ranking schema accepts an empty pick list", () => {
    expect(RankingSchema.safeParse({ summary: "", interests: [], picks: [] }).success).toBe(true);
  });
});
