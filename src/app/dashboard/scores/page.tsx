import Link from "next/link";
import ChipRow from "@/components/mfl/ChipRow";
import MatchupCard from "@/components/mfl/MatchupCard";
import PageHeader from "@/components/mfl/PageHeader";
import { buildMatchups, standingsLookup } from "@/lib/mfl/matchups";
import {
  getCurrentWeek,
  getFranchiseMap,
  getLiveScoring,
  getStandings,
  getWeeklyResults,
} from "@/lib/mfl/queries";
import { getMflSessionCookie } from "@/lib/mfl/session";

const WEEKS = Array.from({ length: 18 }, (_, i) => i + 1);

export default async function ScoresPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week: weekParam } = await searchParams;
  const cookie = await getMflSessionCookie();
  const current = await getCurrentWeek({ cookie });
  const requested = parseInt(weekParam ?? "", 10);
  const week = Math.min(Math.max(Number.isFinite(requested) ? requested : current, 1), 18);

  const [franchises, standings, results, live] = await Promise.all([
    getFranchiseMap({ cookie }),
    getStandings({ cookie }),
    getWeeklyResults(week, { cookie }),
    getLiveScoring(week, { cookie }),
  ]);

  const matchups = buildMatchups({
    matchups: results,
    franchises,
    standings: standingsLookup(standings),
    live,
  });

  return (
    <>
      <PageHeader title="Scores" sub={`Week ${week}`} />

      <ChipRow label="Week">
        {WEEKS.map((w) => (
          <Link
            key={w}
            href={`/dashboard/scores?week=${w}`}
            className="mfl-btn mfl-btn--sm"
            aria-label={`Week ${w}`}
            aria-current={w === week ? "true" : undefined}
          >
            {w}
          </Link>
        ))}
      </ChipRow>

      <div className="mfl-stack" style={{ gap: "var(--space-4)" }}>
        {matchups.length === 0 ? (
          <div className="mfl-card">
            <p className="mfl-empty">No matchups for week {week}.</p>
          </div>
        ) : (
          matchups.map((m) => <MatchupCard key={m.teams[0].id} teams={m.teams} status={m.status} week={week} />)
        )}
      </div>
    </>
  );
}
