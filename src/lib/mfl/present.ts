/** Presentation helpers. The design system's content rules live here:
 *  points show one decimal, a pending number is an em dash, records read "5-1". */

/** MFL names players "Last, First". Show "First Last". */
export function displayName(raw: string | undefined, fallback = ""): string {
  if (!raw) return fallback;
  const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
  return parts.length === 2 ? `${parts[1]} ${parts[0]}` : raw.trim();
}

/**
 * Two-letter team mark for franchises without a licensed logo: first letter of
 * the first and last word ("Road Warrior Hawk" is RH), ignoring a leading "The".
 * One word uses its first two letters.
 */
export function monogram(name: string | undefined): string {
  let words = (name ?? "").replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
  if (words.length > 1 && words[0].toLowerCase() === "the") words = words.slice(1);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export const DASH = "—";

/** One decimal; a missing value is an em dash, never 0.0. */
export function formatPts(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === "") return DASH;
  const n = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(n) ? n.toFixed(1) : DASH;
}

/** "5-1", or "5-1-1" when there are ties. */
export function formatRecord(w: string | number, l: string | number, t: string | number = 0): string {
  const tie = Number(t);
  return tie > 0 ? `${w}-${l}-${t}` : `${w}-${l}`;
}

const POSITION_ORDER = ["QB", "RB", "WR", "TE", "PK", "K", "DEF", "DL", "LB", "DB"];
export function positionRank(pos: string | undefined): number {
  const i = POSITION_ORDER.indexOf(normalizePosition(pos));
  return i === -1 ? POSITION_ORDER.length : i;
}

/** MFL calls them PK and Def; the design system says K and DEF. */
export function normalizePosition(pos: string | undefined): string {
  const p = (pos ?? "").toUpperCase();
  if (p === "PK") return "K";
  return p;
}

export function formatDate(timestampSeconds: string): string {
  return new Date(parseInt(timestampSeconds, 10) * 1000).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export interface StatusBadge {
  label: string;
  tone: "q" | "out";
}

/** Map an NFL injury designation to a design-system status badge. Always has text. */
export function injuryBadge(status: string | undefined): StatusBadge | null {
  switch (status) {
    case "Questionable":
      return { label: "Q", tone: "q" };
    case "Doubtful":
      return { label: "Doubtful", tone: "q" };
    case "Out":
    case "Suspended":
    case "Holdout":
    case "RETIRED":
      return { label: "Out", tone: "out" };
    case "IR":
    case "IR-R":
    case "IR-PUP":
    case "IR-NFI":
      return { label: "IR", tone: "out" };
    default:
      return null;
  }
}

/** Points for a player this week. A zero on the current week means "not played yet": show a dash. */
export function playerPoints(score: string | undefined, isCurrentWeek: boolean): string {
  if (score === undefined) return DASH;
  const n = parseFloat(score);
  if (isCurrentWeek && !(n > 0)) return DASH;
  return formatPts(n);
}
