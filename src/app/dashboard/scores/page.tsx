import Link from "next/link";
import { getFranchiseMap, getLiveScoring, getWeeklyResults } from "@/lib/mfl/queries";
import { getMflSessionCookie } from "@/lib/mfl/session";

const WEEKS = Array.from({ length: 18 }, (_, i) => i + 1);

export default async function ScoresPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week: weekParam } = await searchParams;
  const week = Math.min(Math.max(parseInt(weekParam ?? "1", 10) || 1, 1), 18);

  const cookie = await getMflSessionCookie();
  const [franchises, matchups, live] = await Promise.all([
    getFranchiseMap({ cookie }),
    getWeeklyResults(week, { cookie }),
    getLiveScoring(week, { cookie }),
  ]);

  const liveScores = new Map((live ?? []).map((f) => [f.id, f.score]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-semibold">Scores</h1>
        <div className="flex flex-wrap gap-1">
          {WEEKS.map((w) => (
            <Link
              key={w}
              href={`/dashboard/scores?week=${w}`}
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

      {live === null && (
        <p className="text-sm text-neutral-500">
          Live scoring isn&apos;t available right now &mdash; showing the latest posted results.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {matchups.map((m, i) => (
          <div
            key={i}
            className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 flex flex-col gap-2"
          >
            {m.franchise.map((f) => (
              <div key={f.id} className="flex items-center justify-between text-sm">
                <span>{franchises.get(f.id)?.name ?? f.id}</span>
                <span className="font-mono text-neutral-700 dark:text-neutral-300">
                  {liveScores.get(f.id) ?? f.score ?? "-"}
                </span>
              </div>
            ))}
          </div>
        ))}
        {matchups.length === 0 && (
          <p className="text-sm text-neutral-500">No matchups scheduled for week {week}.</p>
        )}
      </div>
    </div>
  );
}
