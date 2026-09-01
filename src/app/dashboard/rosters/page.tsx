import Link from "next/link";
import { resolvePlayers } from "@/lib/mfl/client";
import { getFranchiseRoster, getLeague } from "@/lib/mfl/queries";
import { getMflSessionCookie } from "@/lib/mfl/session";

export default async function RostersPage({
  searchParams,
}: {
  searchParams: Promise<{ franchise?: string }>;
}) {
  const cookie = await getMflSessionCookie();
  const league = await getLeague({ cookie });
  const franchises = league?.franchises ?? [];

  const { franchise: franchiseParam } = await searchParams;
  const franchiseId = franchiseParam ?? franchises[0]?.id;

  const roster = franchiseId ? await getFranchiseRoster(franchiseId, { cookie }) : null;
  const players = roster
    ? await resolvePlayers(roster.player.map((p) => p.id))
    : new Map();

  const sortedPlayers = roster
    ? [...roster.player].sort((a, b) => {
        const posA = players.get(a.id)?.position ?? "";
        const posB = players.get(b.id)?.position ?? "";
        return posA.localeCompare(posB);
      })
    : [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Rosters</h1>

      <div className="flex flex-wrap gap-1">
        {franchises.map((f) => (
          <Link
            key={f.id}
            href={`/dashboard/rosters?franchise=${f.id}`}
            className={`rounded px-3 py-1.5 text-xs font-medium ${
              f.id === franchiseId
                ? "bg-blue-600 text-white"
                : "bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800"
            }`}
          >
            {f.name}
          </Link>
        ))}
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
