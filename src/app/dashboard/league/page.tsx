import { getLeague } from "@/lib/mfl/queries";
import { getMflSessionCookie } from "@/lib/mfl/session";
import { MFL_LEAGUE_ID, MFL_YEAR } from "@/lib/mfl/config";

export default async function LeagueInfoPage() {
  const cookie = await getMflSessionCookie();
  const league = await getLeague({ cookie });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">{league?.name ?? "League Info"}</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          League #{MFL_LEAGUE_ID} &middot; {MFL_YEAR} season
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {[
          { label: "Roster Size", value: league?.rosterSize },
          { label: "Start Week", value: league?.startWeek },
          { label: "End Week", value: league?.endWeek },
          { label: "Last Regular Season Week", value: league?.lastRegularSeasonWeek },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4"
          >
            <p className="text-xs uppercase tracking-wide text-neutral-500">{stat.label}</p>
            <p className="text-xl font-semibold">{stat.value ?? "-"}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Franchises</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {(league?.franchises ?? []).map((f) => (
            <div
              key={f.id}
              className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 flex items-center gap-3"
            >
              {f.icon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.icon} alt="" className="h-10 w-10 rounded object-cover" />
              ) : (
                <div className="h-10 w-10 rounded bg-neutral-200 dark:bg-neutral-800" />
              )}
              <div>
                <p className="text-sm font-medium">{f.name}</p>
                {f.abbrev && <p className="text-xs text-neutral-500">{f.abbrev}</p>}
              </div>
            </div>
          ))}
        </div>
        {(!league || league.franchises.length === 0) && (
          <p className="text-sm text-neutral-500">No franchises found.</p>
        )}
      </section>
    </div>
  );
}
