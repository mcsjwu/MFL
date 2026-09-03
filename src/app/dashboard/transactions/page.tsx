import type { ReactNode } from "react";
import { resolvePlayers } from "@/lib/mfl/client";
import { getFranchiseMap, getTransactions, MflTransaction } from "@/lib/mfl/queries";
import { getMflSessionCookie } from "@/lib/mfl/session";

function splitIds(csv?: string): string[] {
  return (csv ?? "").split(",").map((s) => s.trim()).filter(Boolean);
}

function isDraftPick(token: string): boolean {
  return token.startsWith("DP_") || token.startsWith("FP_");
}

/** FREE_AGENT/WAIVER `transaction` field is "DROPPED_IDS,|ADDED_IDS,". */
function parseAddDrop(transaction?: string): { dropped: string[]; added: string[] } {
  const [dropped = "", added = ""] = (transaction ?? "").split("|");
  return { dropped: splitIds(dropped), added: splitIds(added) };
}

export default async function TransactionsPage() {
  const cookie = await getMflSessionCookie();
  const [franchises, transactions] = await Promise.all([
    getFranchiseMap({ cookie }),
    getTransactions({ cookie }),
  ]);

  const allPlayerIds = new Set<string>();
  for (const tx of transactions) {
    if (tx.type === "TRADE") {
      const t = tx as MflTransaction & { franchise1_gave_up?: string; franchise2_gave_up?: string };
      [...splitIds(t.franchise1_gave_up), ...splitIds(t.franchise2_gave_up)]
        .filter((id) => !isDraftPick(id))
        .forEach((id) => allPlayerIds.add(id));
    } else {
      const { dropped, added } = parseAddDrop(tx.transaction);
      [...dropped, ...added].forEach((id) => allPlayerIds.add(id));
    }
    splitIds(tx.activated).forEach((id) => allPlayerIds.add(id));
    splitIds(tx.deactivated).forEach((id) => allPlayerIds.add(id));
  }
  const players = await resolvePlayers([...allPlayerIds]);
  const playerName = (id: string) => players.get(id)?.name ?? (isDraftPick(id) ? id : `Player #${id}`);

  const visible = transactions.filter(
    (tx) => tx.type !== "LOCK_ALL_PLAYERS" && tx.type !== "UNLOCK_ALL_PLAYERS"
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Transactions</h1>

      <div className="flex flex-col gap-3">
        {visible.map((tx, i) => {
          const date = new Date(parseInt(tx.timestamp, 10) * 1000).toLocaleString();
          const team = franchises.get(tx.franchise)?.name ?? tx.franchise;

          let body: ReactNode;
          if (tx.type === "TRADE") {
            const t = tx as MflTransaction & {
              franchise2?: string;
              franchise1_gave_up?: string;
              franchise2_gave_up?: string;
            };
            const team2 = franchises.get(t.franchise2 ?? "")?.name ?? t.franchise2;
            body = (
              <div className="flex flex-col gap-1">
                <span>
                  <strong>{team}</strong> traded away{" "}
                  {splitIds(t.franchise1_gave_up).map(playerName).join(", ") || "nothing"}
                </span>
                <span>
                  <strong>{team2}</strong> traded away{" "}
                  {splitIds(t.franchise2_gave_up).map(playerName).join(", ") || "nothing"}
                </span>
              </div>
            );
          } else if (tx.type === "IR") {
            body = (
              <span>
                <strong>{team}</strong>
                {splitIds(tx.activated).length > 0 &&
                  ` activated ${splitIds(tx.activated).map(playerName).join(", ")}`}
                {splitIds(tx.deactivated).length > 0 &&
                  ` placed ${splitIds(tx.deactivated).map(playerName).join(", ")} on IR`}
              </span>
            );
          } else {
            const { dropped, added } = parseAddDrop(tx.transaction);
            body = (
              <span>
                <strong>{team}</strong>
                {added.length > 0 && ` added ${added.map(playerName).join(", ")}`}
                {added.length > 0 && dropped.length > 0 && "; "}
                {dropped.length > 0 && ` dropped ${dropped.map(playerName).join(", ")}`}
              </span>
            );
          }

          return (
            <div
              key={i}
              className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="uppercase tracking-wide">{tx.type.replace(/_/g, " ")}</span>
                <span>{date}</span>
              </div>
              <div className="text-sm">{body}</div>
            </div>
          );
        })}
        {visible.length === 0 && (
          <p className="text-sm text-neutral-500">No transactions yet.</p>
        )}
      </div>
    </div>
  );
}
