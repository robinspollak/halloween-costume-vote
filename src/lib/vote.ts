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
