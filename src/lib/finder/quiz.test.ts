import { describe, expect, it } from "vitest";
import { findGifts } from "./engine";
import { KNOWN_SUBJECTS } from "./match";
import { parseBrief } from "./parse";
import { allInterests, BUDGETS, composeBrief, emptyAnswers, OCCASIONS, RECIPIENTS, type QuizAnswers } from "./quiz";
import { stem, tokenize } from "./vocabulary";

const TODAY = "2026-10-22";
const answers = (a: Partial<QuizAnswers>): QuizAnswers => ({ ...emptyAnswers, ...a });

describe("guided Gift Finder", () => {
  it("writes the choices up as a readable brief", () => {
    const brief = composeBrief(
      answers({ recipient: "mom", occasion: "birthday", interests: ["coffee", "plants"], styles: ["handmade"], budget: "2000", when: "week", area: "Andheri" }),
      TODAY,
    );
    expect(brief).toBe("A birthday gift for my mom. She loves coffee and plants. Something handmade. Under ₹2,000. Needed by 29 Oct in Andheri.");
  });

  it("the parser reads back the budget, date, area, recipient and occasion", () => {
    const brief = composeBrief(
      answers({ recipient: "brother", occasion: "diwali", interests: ["cheese"], budget: "3000", when: "date", date: "2026-11-05", area: "Bandra" }),
      TODAY,
    );
    const facts = parseBrief(brief, TODAY);
    expect(facts.budgetMax).toBe(3000);
    expect(facts.date?.iso).toBe("2026-11-05");
    expect(facts.destination?.kind).toBe("zone");
    expect(facts.recipient).toBe("sibling");
    expect(facts.occasion).toBe("festivals");
  });

  it("every interest choice is a word the finder knows", () => {
    for (const c of allInterests) {
      const known = tokenize(c.words).some((w) => KNOWN_SUBJECTS.has(stem(w)));
      expect(known, c.label).toBe(true);
    }
  });

  it("every single-interest brief is understood (never nonsense or off-topic)", async () => {
    for (const c of allInterests) {
      const r = await findGifts({ brief: composeBrief(answers({ recipient: "friend", interests: [c.id] }), TODAY) }, { today: TODAY });
      expect(["results", "no_match", "follow_up"], `${c.label}: ${r.status}`).toContain(r.status);
      expect(r.status, c.label).not.toBe("follow_up");
    }
  });

  it("recipient, occasion and budget choices alone still make sense to the finder", async () => {
    for (const rc of RECIPIENTS) {
      for (const oc of [OCCASIONS[0], OCCASIONS.at(-1)!]) {
        const brief = composeBrief(answers({ recipient: rc.id, occasion: oc.id, budget: BUDGETS[3].id }), TODAY);
        const r = await findGifts({ brief }, { today: TODAY });
        expect(["nonsense", "off_topic"], brief).not.toContain(r.status);
      }
    }
  });
});
