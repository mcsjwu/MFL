import { normalizePosition } from "@/lib/mfl/present";

const KNOWN = new Set(["QB", "RB", "WR", "TE", "K", "DEF"]);

/** Position tag. Always carries its letters; colour is never the only signal. */
export default function PositionBadge({ position }: { position: string | undefined }) {
  const pos = normalizePosition(position) || "—";
  const cls = KNOWN.has(pos) ? ` mfl-badge--${pos.toLowerCase()}` : "";
  return <span className={`mfl-badge${cls}`}>{pos}</span>;
}
