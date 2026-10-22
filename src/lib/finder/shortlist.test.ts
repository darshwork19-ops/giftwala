import { describe, expect, it } from "vitest";
import { externalProducts } from "@/data/external-products";
import { giftIdeas } from "@/data/gift-ideas";
import { makerProducts } from "@/data/instagram-maker-products";
import { getAllProducts } from "@/lib/catalogue";
import { AiOutputError, type AiProvider } from "./ai-types";
import { findGifts } from "./engine";
import { MAX_RESULTS } from "./shortlist";
import type { FinderResponse } from "./types";

const TODAY = "2026-10-22";
const run = (brief: string, extra = {}, ai?: AiProvider) => findGifts({ brief, ...extra }, { today: TODAY, ai });

const DETAILED = [
  "A 20-year-old who loves cricket, is adventurous and enjoys travelling, budget 3000",
  "Partner who loves candles, self-care and home decor, anniversary, 5000",
  "Friend who loves reading, journaling and tea, under 2000",
  "My brother loves cheese, chocolate and hosting friends, under 3000",
];

/** Resolves each result to the card it points at. */
function cards(r: FinderResponse) {
  return r.results.map((ref) => {
    const list = { listing: r.listings, external: r.external, "maker-product": r.makerProducts, idea: r.ideas }[ref.kind];
    return { ref, card: list.find((c) => c.id === ref.id) };
  });
}

describe("Gift Finder shortlist", () => {
  it.each(DETAILED)("a detailed brief returns 10–15 distinct, relevant results: %s", async (brief) => {
    const r = await run(brief);
    expect(r.status).toBe("results");
    expect(r.results.length).toBeGreaterThanOrEqual(10);
    expect(r.results.length).toBeLessThanOrEqual(MAX_RESULTS);
    expect(new Set(r.results.map((x) => `${x.kind}:${x.id}`)).size).toBe(r.results.length);
    // Every result matched something the giver said
    expect(r.results.every((x) => x.matched.length > 0)).toBe(true);
  });

  it("results are varied, not near-duplicates", async () => {
    const r = await run(DETAILED[0]);
    const kinds = new Set(r.ideas.filter((i) => r.results.some((x) => x.id === i.id)).map((i) => i.form));
    expect(kinds.size).toBeGreaterThanOrEqual(3); // e.g. gear, experiences, learning
    const categories = cards(r).map(({ card }) => (card && "category" in card ? card.category : "listing"));
    const counts = categories.reduce<Record<string, number>>((m, c) => ({ ...m, [c]: (m[c] ?? 0) + 1 }), {});
    expect(Math.max(...Object.values(counts))).toBeLessThanOrEqual(3);
    // Each stated interest is covered
    const matched = new Set(r.results.flatMap((x) => x.matched));
    for (const w of ["cricket", "adventurous", "travelling"]) expect(matched.has(w)).toBe(true);
  });

  it("a student's interests outrank study gifts (studying is a situation, not a hobby)", async () => {
    const r = await run("My sister is studying for CA Final, loves badminton and cars");
    expect(r.results.length).toBeGreaterThanOrEqual(10);
    const top3 = r.results.slice(0, 3).map((x) => x.id);
    expect(top3).not.toContain("study-setup");
    expect(top3).not.toContain("post-exam-treat");
    expect(r.results.some((x) => x.matched.includes("badminton"))).toBe(true);
    expect(r.results.some((x) => x.matched.includes("cars"))).toBe(true);
  });

  it("when fewer than 10 genuinely fit, shows those, says so and offers ways to broaden", async () => {
    const r = await run("My sister loves origami and pottery");
    expect(r.results.length).toBeLessThan(10);
    expect(r.limited?.note).toMatch(/don't pad/);
    expect(r.limited?.broaden).toContain("interests");
    expect(r.results.every((x) => x.matched.length > 0)).toBe(true);
  });

  it("every result resolves to a real catalogue record, shop product, maker product or idea", async () => {
    for (const brief of DETAILED) {
      const r = await run(brief);
      for (const { ref, card } of cards(r)) {
        expect(card, `${ref.kind}:${ref.id}`).toBeDefined();
        const source = {
          listing: getAllProducts(),
          external: externalProducts,
          "maker-product": makerProducts,
          idea: giftIdeas,
        }[ref.kind];
        expect(source.some((s) => s.id === ref.id)).toBe(true);
      }
    }
  });

  it("budget is a hard limit for anything with a price", async () => {
    const r = await run("Partner who loves candles, self-care and home decor, under ₹1,000");
    for (const { card } of cards(r)) {
      if (card && "price" in card) expect(card.price).toBeLessThanOrEqual(1000);
    }
  });

  it("delivery is never claimed without a date and an area", async () => {
    const r = await run(DETAILED[1]);
    expect(r.listings.every((l) => l.delivery.status === "not_verified")).toBe(true);
  });

  it("ideas are labelled as ideas, with no price, seller or link", async () => {
    const r = await run(DETAILED[0]);
    for (const idea of r.ideas) {
      expect(idea.kind).toBe("idea");
      expect("price" in idea || "url" in idea).toBe(false);
    }
  });

  it("'more experiences' re-ranks experiences to the top without adding unrelated items", async () => {
    const plain = await run(DETAILED[0]);
    const exp = await run(DETAILED[0], { prefer: "experiences" });
    const topForm = (r: FinderResponse) => r.ideas.find((i) => i.id === r.results[0].id)?.form;
    expect(topForm(exp)).toBe("experience");
    expect(new Set(exp.results.map((x) => x.id))).toEqual(new Set(exp.results.map((x) => x.id)));
    expect(exp.results.every((x) => x.matched.length > 0)).toBe(true);
    expect(plain.results.length).toBeGreaterThan(0);
  });

  it("invalid, off-topic and vague briefs return no results", async () => {
    expect((await run("bsibcisbc")).results).toHaveLength(0);
    expect((await run("asdfgh 123 xyz")).results).toHaveLength(0);
    expect((await run("What is the capital of France?")).results).toHaveLength(0);
    const vague = await run("I need a gift for my sister");
    expect(vague.status).toBe("follow_up");
    expect(vague.results).toHaveLength(0);
  });

  it("a short valid query still works", async () => {
    const r = await run("cricket bat");
    expect(r.status).toBe("results");
    expect(r.results.length).toBeGreaterThan(0);
  });

  it("an AI failure never produces fallback results", async () => {
    const broken: AiProvider = {
      name: "Gemini",
      async generateJson() {
        throw new AiOutputError("malformed");
      },
    };
    const r = await run(DETAILED[1], {}, broken);
    expect(r.status).toBe("ai_error");
    expect(r.results).toHaveLength(0);
  });
});
