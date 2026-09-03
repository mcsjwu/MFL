import { getFranchiseMap, getSchedule } from "@/lib/mfl/queries";
import { getMflSessionCookie } from "@/lib/mfl/session";

export default async function SchedulePage() {
  const cookie = await getMflSessionCookie();
  const [franchises, weeks] = await Promise.all([
    getFranchiseMap({ cookie }),
    getSchedule({ cookie }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Schedule</h1>

      {weeks.map((week) => (
        <section key={week.week} className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">Week {week.week}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {week.matchup.map((m, i) => (
              <div
                key={i}
                className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 flex flex-col gap-2"
              >
                {m.franchise.map((f) => (
                  <div key={f.id} className="flex items-center justify-between text-sm">
                    <span>{franchises.get(f.id)?.name ?? f.id}</span>
                    {f.isHome === "1" && (
                      <span className="text-xs text-neutral-400">home</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      ))}

      {weeks.length === 0 && <p className="text-sm text-neutral-500">Schedule not available.</p>}
    </div>
  );
}
