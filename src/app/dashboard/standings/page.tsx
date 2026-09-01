import { getFranchiseMap, getStandings } from "@/lib/mfl/queries";
import { getMflSessionCookie } from "@/lib/mfl/session";

export default async function StandingsPage() {
  const cookie = await getMflSessionCookie();
  const [franchises, standings] = await Promise.all([
    getFranchiseMap({ cookie }),
    getStandings({ cookie }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Standings</h1>
      <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 dark:bg-neutral-900 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">#</th>
              <th className="px-3 py-2 font-medium">Team</th>
              <th className="px-3 py-2 font-medium">W</th>
              <th className="px-3 py-2 font-medium">L</th>
              <th className="px-3 py-2 font-medium">T</th>
              <th className="px-3 py-2 font-medium">Pct</th>
              <th className="px-3 py-2 font-medium">PF</th>
              <th className="px-3 py-2 font-medium">PA</th>
              <th className="px-3 py-2 font-medium">Streak</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, i) => (
              <tr key={row.id} className="border-t border-neutral-200 dark:border-neutral-800">
                <td className="px-3 py-2 text-neutral-500">{i + 1}</td>
                <td className="px-3 py-2 font-medium">{franchises.get(row.id)?.name ?? row.id}</td>
                <td className="px-3 py-2">{row.h2hw}</td>
                <td className="px-3 py-2">{row.h2hl}</td>
                <td className="px-3 py-2">{row.h2ht}</td>
                <td className="px-3 py-2">{row.h2hpct}</td>
                <td className="px-3 py-2">{row.pf}</td>
                <td className="px-3 py-2">{row.pa}</td>
                <td className="px-3 py-2">{row.strk ?? "-"}</td>
              </tr>
            ))}
            {standings.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-4 text-center text-neutral-500">
                  Standings aren&apos;t available yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
