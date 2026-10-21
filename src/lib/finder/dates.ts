/**
 * Date helpers for delivery checks. All dates are plain "YYYY-MM-DD" strings
 * in India time (IST), so there are no time-zone surprises on the server.
 */

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** Today's date in India, e.g. "2026-10-21". */
export function todayInIndia(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now);
}

function toDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const d = toDate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toIso(d);
}

/** Adds working days, where makers work Monday to Saturday. */
export function addWorkingDays(iso: string, days: number): string {
  let current = iso;
  let added = 0;
  while (added < days) {
    current = addDays(current, 1);
    if (toDate(current).getUTCDay() !== 0) added++;
  }
  return current;
}

export function daysBetween(fromIso: string, toIso_: string): number {
  return Math.round((toDate(toIso_).getTime() - toDate(fromIso).getTime()) / 86_400_000);
}

/** "Sat 24 Oct" */
export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(toDate(iso));
}

/**
 * Reads a date from phrases such as "today", "tomorrow", "on Saturday",
 * "next Friday", "25 Oct", "Oct 25" or "25/10". Returns undefined when no date
 * is mentioned. Dates in the past roll forward to next year.
 */
export function parseDate(text: string, today: string): { iso: string; phrase: string } | undefined {
  const lower = text.toLowerCase();

  if (/\btoday\b|\btonight\b/.test(lower)) return { iso: today, phrase: "today" };
  if (/\bday after tomorrow\b/.test(lower)) return { iso: addDays(today, 2), phrase: "day after tomorrow" };
  if (/\btomorrow\b|\btmrw\b/.test(lower)) return { iso: addDays(today, 1), phrase: "tomorrow" };

  const weekday = lower.match(
    /\b(next\s+|this\s+|on\s+|by\s+)?(sun|mon|tue|tues|wed|thu|thur|thurs|fri|sat)(day|nesday|rsday|urday|sday)?\b/,
  );
  if (weekday) {
    const target = WEEKDAYS.findIndex((d) => d.startsWith(weekday[2]));
    const todayIdx = toDate(today).getUTCDay();
    let diff = (target - todayIdx + 7) % 7;
    if (diff === 0) diff = 7; // "Saturday" said on a Saturday means next week
    if (weekday[1]?.trim() === "next" && diff < 7) diff += 7;
    return { iso: addDays(today, diff), phrase: weekday[0].trim() };
  }

  const year = Number(today.slice(0, 4));
  const build = (day: number, monthIdx: number) => {
    if (day < 1 || day > 31 || monthIdx < 0 || monthIdx > 11) return undefined;
    let iso = `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (iso < today) iso = `${year + 1}${iso.slice(4)}`;
    return iso;
  };

  const dayMonth = lower.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?([a-z]{3})[a-z]*\b/);
  if (dayMonth && MONTHS.includes(dayMonth[2])) {
    const iso = build(Number(dayMonth[1]), MONTHS.indexOf(dayMonth[2]));
    if (iso) return { iso, phrase: dayMonth[0] };
  }
  const monthDay = lower.match(/\b([a-z]{3})[a-z]*\s+(\d{1,2})(?:st|nd|rd|th)?\b/);
  if (monthDay && MONTHS.includes(monthDay[1])) {
    const iso = build(Number(monthDay[2]), MONTHS.indexOf(monthDay[1]));
    if (iso) return { iso, phrase: monthDay[0] };
  }
  const numeric = lower.match(/\b(\d{1,2})\/(\d{1,2})\b/);
  if (numeric) {
    const iso = build(Number(numeric[1]), Number(numeric[2]) - 1);
    if (iso) return { iso, phrase: numeric[0] };
  }
  return undefined;
}
