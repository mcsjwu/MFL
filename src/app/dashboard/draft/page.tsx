import { resolvePlayers } from "@/lib/mfl/client";
import { getDraftResults, getFranchiseMap } from "@/lib/mfl/queries";
import { getMflSessionCookie } from "@/lib/mfl/session";

export default async function DraftPage() {
  const cookie = await getMflSessionCookie();
  const [franchises, picks] = await Promise.all([
    getFranchiseMap({ cookie }),
    getDraftResults({ cookie }),
  ]);
  const players = await resolvePlayers(picks.map((p) => p.player));

  const rounds = new Map<string, typeof picks>();
  for (const pick of picks) {
    const list = rounds.get(pick.round) ?? [];
    list.push(pick);
    rounds.set(pick.round, list);
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Draft Results</h1>

      {[...rounds.entries()].map(([round, roundPicks]) => (
        <section key={round} className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">Round {round}</h2>
          <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
            <table className="w-full text-sm">
              <thead className="bg-neutral-100 dark:bg-neutral-900 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Pick</th>
                  <th className="px-3 py-2 font-medium">Team</th>
                  <th className="px-3 py-2 font-medium">Player</th>
                </tr>
              </thead>
              <tbody>
                {roundPicks.map((pick) => (
                  <tr
                    key={`${pick.round}-${pick.pick}`}
                    className="border-t border-neutral-200 dark:border-neutral-800"
                  >
                    <td className="px-3 py-2 text-neutral-500">{pick.pick}</td>
                    <td className="px-3 py-2">{franchises.get(pick.franchise)?.name ?? pick.franchise}</td>
                    <td className="px-3 py-2">
                      {players.get(pick.player)?.name ?? `Player #${pick.player}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {picks.length === 0 && <p className="text-sm text-neutral-500">No draft results available yet.</p>}
    </div>
  );
}
