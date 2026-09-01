import Link from "next/link";
import { getFranchiseMap, getStandings, getWeeklyResults } from "@/lib/mfl/queries";
import { getMflSessionCookie } from "@/lib/mfl/session";
import { MFL_LEAGUE_ID } from "@/lib/mfl/config";

export default async function DashboardHome() {
  const cookie = await getMflSessionCookie();
  const [franchises, standings, matchups] = await Promise.all([
    getFranchiseMap({ cookie }),
    getStandings({ cookie }),
    getWeeklyResults(1, { cookie }),
  ]);

  const topStandings = standings.slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">League #{MFL_LEAGUE_ID}</p>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-medium">Standings</h2>
          <Link href="/dashboard/standings" className="text-sm text-blue-600 hover:underline">
            View full standings
          </Link>
        </div>
        <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
          <table className="w-full text-sm">
            <thead className="bg-neutral-100 dark:bg-neutral-900 text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Team</th>
                <th className="px-3 py-2 font-medium">W-L-T</th>
                <th className="px-3 py-2 font-medium">PF</th>
                <th className="px-3 py-2 font-medium">PA</th>
              </tr>
            </thead>
            <tbody>
              {topStandings.map((row) => (
                <tr key={row.id} className="border-t border-neutral-200 dark:border-neutral-800">
                  <td className="px-3 py-2">{franchises.get(row.id)?.name ?? row.id}</td>
                  <td className="px-3 py-2">
                    {row.h2hw}-{row.h2hl}-{row.h2ht}
                  </td>
                  <td className="px-3 py-2">{row.pf}</td>
                  <td className="px-3 py-2">{row.pa}</td>
                </tr>
              ))}
              {topStandings.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-neutral-500">
                    Standings aren&apos;t available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-medium">Week 1 Matchups</h2>
          <Link href="/dashboard/scores" className="text-sm text-blue-600 hover:underline">
            View all scores
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {matchups.map((m, i) => (
            <div
              key={i}
              className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 flex flex-col gap-2"
            >
              {m.franchise.map((f) => (
                <div key={f.id} className="flex items-center justify-between text-sm">
                  <span>{franchises.get(f.id)?.name ?? f.id}</span>
                  <span className="font-mono text-neutral-500">{f.score ?? "-"}</span>
                </div>
              ))}
            </div>
          ))}
          {matchups.length === 0 && (
            <p className="text-sm text-neutral-500">No matchups scheduled for week 1 yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
