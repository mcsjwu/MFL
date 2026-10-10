import PageHeader from "@/components/mfl/PageHeader";
import { resolvePlayers } from "@/lib/mfl/client";
import { displayName, formatDate } from "@/lib/mfl/present";
import { getFranchiseMap, getTransactions, type MflTransaction } from "@/lib/mfl/queries";
import { getMflSessionCookie } from "@/lib/mfl/session";

const LIMIT = 40;

type Trade = MflTransaction & {
  franchise2?: string;
  franchise1_gave_up?: string;
  franchise2_gave_up?: string;
};

const splitIds = (csv?: string) => (csv ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const isDraftPick = (token: string) => token.startsWith("DP_") || token.startsWith("FP_");

/**
 * FREE_AGENT / WAIVER `transaction` is "ADDED_IDS,|DROPPED_IDS,"; BBID_WAIVER
 * puts the bid in the middle: "ADDED_IDS,|BID|DROPPED_IDS,".
 */
function parseAddDrop(transaction?: string) {
  const parts = (transaction ?? "").split("|");
  const added = splitIds(parts[0]);
  const bid = parts.length === 3 ? Number.parseFloat(parts[1]) : undefined;
  const dropped = splitIds(parts[parts.length - 1] ?? "");
  return { added, dropped, bid: bid !== undefined && Number.isFinite(bid) ? bid : undefined };
}

const TYPE_LABELS: Record<string, string> = {
  FREE_AGENT: "Free agent",
  WAIVER: "Waiver",
  BBID_WAIVER: "Blind bid",
  TRADE: "Trade",
  IR: "Injured reserve",
  TAXI: "Taxi squad",
};
const typeLabel = (type: string) =>
  TYPE_LABELS[type] ?? type.charAt(0) + type.slice(1).toLowerCase().replace(/_/g, " ");

export default async function TransactionsPage() {
  const cookie = await getMflSessionCookie();
  const [franchises, all] = await Promise.all([getFranchiseMap({ cookie }), getTransactions({ cookie })]);

  const transactions = all
    .filter((tx) => tx.type !== "LOCK_ALL_PLAYERS" && tx.type !== "UNLOCK_ALL_PLAYERS")
    .slice(0, LIMIT);

  const ids = new Set<string>();
  for (const tx of transactions) {
    if (tx.type === "TRADE") {
      const t = tx as Trade;
      [...splitIds(t.franchise1_gave_up), ...splitIds(t.franchise2_gave_up)]
        .filter((id) => !isDraftPick(id))
        .forEach((id) => ids.add(id));
    } else {
      const { dropped, added } = parseAddDrop(tx.transaction);
      [...dropped, ...added].forEach((id) => ids.add(id));
    }
    splitIds(tx.activated).forEach((id) => ids.add(id));
    splitIds(tx.deactivated).forEach((id) => ids.add(id));
  }
  const players = await resolvePlayers([...ids]);
  const who = (id: string) => (isDraftPick(id) ? "a draft pick" : displayName(players.get(id)?.name, `Player #${id}`));
  const list = (csv?: string) => splitIds(csv).map(who).join(", ");
  const team = (id?: string) => franchises.get(id ?? "")?.name?.trim() ?? id ?? "";

  return (
    <>
      <PageHeader title="Transactions" />
      <div className="mfl-card">
        {transactions.length === 0 ? (
          <p className="mfl-empty">No transactions yet.</p>
        ) : (
          <ul className="mfl-rows">
            {transactions.map((tx, i) => {
              const lines: string[] = [];
              let title = team(tx.franchise);
              if (tx.type === "TRADE") {
                const t = tx as Trade;
                title = `${team(t.franchise)} and ${team(t.franchise2)}`;
                lines.push(`${team(t.franchise)} sent ${list(t.franchise1_gave_up) || "nothing"}`);
                lines.push(`${team(t.franchise2)} sent ${list(t.franchise2_gave_up) || "nothing"}`);
              } else if (tx.type === "IR") {
                if (splitIds(tx.deactivated).length) lines.push(`Placed on IR: ${list(tx.deactivated)}`);
                if (splitIds(tx.activated).length) lines.push(`Activated: ${list(tx.activated)}`);
              } else {
                const { dropped, added, bid } = parseAddDrop(tx.transaction);
                if (added.length) lines.push(`Added ${added.map(who).join(", ")}${bid !== undefined ? ` for $${bid}` : ""}`);
                if (dropped.length) lines.push(`Dropped ${dropped.map(who).join(", ")}`);
              }
              return (
                <li key={i} className="mfl-row" style={{ alignItems: "flex-start" }}>
                  <span className="mfl-row__main">
                    <span className="mfl-eyebrow">{typeLabel(tx.type)}</span>
                    <span className="mfl-row__title">{title}</span>
                    {lines.map((line) => (
                      <span key={line} className="mfl-row__sub">
                        {line}
                      </span>
                    ))}
                  </span>
                  <span className="mfl-row__end mfl-caption">{formatDate(tx.timestamp)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {all.length > LIMIT && <p className="mfl-caption" style={{ textAlign: "center", margin: 0 }}>Showing the latest {LIMIT} moves.</p>}
    </>
  );
}
