// Shared by the server and the browser combobox script, so no server imports here.

export const OTHER = "__other__";
export const MAX_NAME = 60;

export const CATEGORIES = [
  { key: "best", label: "Best overall", emoji: "🏆" },
  { key: "scariest", label: "Scariest", emoji: "💀" },
  { key: "funniest", label: "Funniest", emoji: "🤡" },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]["key"];

export function cleanName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

/** Votes for "steve" and "Steve " count as the same person. */
export function nameKey(name: string): string {
  return cleanName(name).toLowerCase();
}

/**
 * Guests whose name contains the query, with word-start matches first
 * ("ma" finds Maya before Emma).
 */
export function matchGuests(guests: string[], query: string, limit = 8): string[] {
  const q = nameKey(query);
  if (!q) return guests.slice(0, limit);
  const starts: string[] = [];
  const contains: string[] = [];
  for (const g of guests) {
    const k = g.toLowerCase();
    if (k.startsWith(q) || k.includes(` ${q}`)) starts.push(g);
    else if (k.includes(q)) contains.push(g);
  }
  return [...starts, ...contains].slice(0, limit);
}

/**
 * Ballot rules beyond "fill everything in": no voting for yourself, and one
 * person can't win you over in more than one category. Errors land on the
 * later field so the first pick stands.
 */
export function ruleProblems(picks: Partial<Record<"voter" | CategoryKey, string>>): Partial<Record<CategoryKey, string>> {
  const problems: Partial<Record<CategoryKey, string>> = {};
  const voterKey = picks.voter ? nameKey(picks.voter) : "";
  const seen = new Map<string, string>();
  for (const c of CATEGORIES) {
    const pick = picks[c.key];
    if (!pick) continue;
    const k = nameKey(pick);
    if (voterKey && k === voterKey) {
      problems[c.key] = "Nice try. No voting for yourself!";
    } else if (seen.has(k)) {
      problems[c.key] = `You already picked ${pick} for ${seen.get(k)}. Spread the love!`;
    } else {
      seen.set(k, c.label.toLowerCase());
    }
  }
  return problems;
}
