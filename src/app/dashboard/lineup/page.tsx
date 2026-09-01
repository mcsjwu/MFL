import Link from "next/link";
import { resolvePlayers } from "@/lib/mfl/client";
import { getFranchiseRoster, getLeague } from "@/lib/mfl/queries";
import { getMflSessionCookie, getMyFranchiseId } from "@/lib/mfl/session";
import LineupEditor from "./LineupEditor";

const WEEKS = Array.from({ length: 18 }, (_, i) => i + 1);

export default async function LineupPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week: weekParam } = await searchParams;
  const week = Math.min(Math.max(parseInt(weekParam ?? "1", 10) || 1, 1), 18);

  const cookie = await getMflSessionCookie();
  const franchiseId = await getMyFranchiseId();

  if (!franchiseId) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Set Lineup</h1>
        <p className="text-sm text-neutral-500">
          We couldn&apos;t automatically detect your franchise in this league, so we don&apos;t
          know which roster to edit. Try signing out and back in.
        </p>
      </div>
    );
  }

  const [league, roster] = await Promise.all([
    getLeague({ cookie }),
    getFranchiseRoster(franchiseId, { cookie, week }),
  ]);

  const players = roster ? await resolvePlayers(roster.player.map((p) => p.id)) : new Map();
  const rosterPlayers = (roster?.player ?? []).map((p) => {
    const info = players.get(p.id);
    return {
      id: p.id,
      name: info?.name ?? `Player #${p.id}`,
      position: info?.position ?? "UNK",
      team: info?.team ?? "",
    };
  });
  const initialStarters = (roster?.player ?? [])
    .filter((p) => p.status?.toUpperCase() === "STARTER")
    .map((p) => p.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Set Lineup</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {league?.franchises.find((f) => f.id === franchiseId)?.name ?? "My Team"}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {WEEKS.map((w) => (
            <Link
              key={w}
              href={`/dashboard/lineup?week=${w}`}
              className={`rounded px-2 py-1 text-xs font-medium ${
                w === week
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800"
              }`}
            >
              {w}
            </Link>
          ))}
        </div>
      </div>

      {rosterPlayers.length === 0 ? (
        <p className="text-sm text-neutral-500">No roster data available for this week.</p>
      ) : (
        <LineupEditor
          week={week}
          players={rosterPlayers}
          starterCount={league?.starterCount}
          starterPositions={league?.starterPositions ?? []}
          initialStarters={initialStarters}
        />
      )}
    </div>
  );
}
