import Link from "next/link";
import { resolvePlayers } from "@/lib/mfl/client";
import { getFranchiseRoster, getLeague } from "@/lib/mfl/queries";
import { getMflSessionCookie, getMyFranchiseId } from "@/lib/mfl/session";

export default async function MyTeamPage() {
  const cookie = await getMflSessionCookie();
  const franchiseId = await getMyFranchiseId();

  if (!franchiseId) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">My Team</h1>
        <p className="text-sm text-neutral-500">
          We couldn&apos;t automatically detect your franchise in this league. Pick your team from{" "}
          <Link href="/dashboard/rosters" className="text-blue-600 hover:underline">
            Rosters
          </Link>{" "}
          instead.
        </p>
      </div>
    );
  }

  const [league, roster] = await Promise.all([
    getLeague({ cookie }),
    getFranchiseRoster(franchiseId, { cookie }),
  ]);

  const franchise = league?.franchises.find((f) => f.id === franchiseId);
  const players = roster ? await resolvePlayers(roster.player.map((p) => p.id)) : new Map();
  const sortedPlayers = roster
    ? [...roster.player].sort((a, b) => {
        const posA = players.get(a.id)?.position ?? "";
        const posB = players.get(b.id)?.position ?? "";
        return posA.localeCompare(posB);
      })
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{franchise?.name ?? "My Team"}</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {sortedPlayers.length} player{sortedPlayers.length === 1 ? "" : "s"} on roster
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 dark:bg-neutral-900 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Player</th>
              <th className="px-3 py-2 font-medium">Position</th>
              <th className="px-3 py-2 font-medium">Team</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((p) => {
              const player = players.get(p.id);
              return (
                <tr key={p.id} className="border-t border-neutral-200 dark:border-neutral-800">
                  <td className="px-3 py-2">{player?.name ?? `Player #${p.id}`}</td>
                  <td className="px-3 py-2">{player?.position ?? "-"}</td>
                  <td className="px-3 py-2">{player?.team ?? "-"}</td>
                </tr>
              );
            })}
            {sortedPlayers.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-4 text-center text-neutral-500">
                  No roster data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
