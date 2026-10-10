import Link from "next/link";
import MatchupCard from "@/components/mfl/MatchupCard";
import PageHeader from "@/components/mfl/PageHeader";
import StandingsTable from "@/components/mfl/StandingsTable";
import { buildMatchups, standingsLookup } from "@/lib/mfl/matchups";
import {
  getCurrentWeek,
  getFranchiseMap,
  getLiveScoring,
  getStandings,
  getWeeklyResults,
} from "@/lib/mfl/queries";
import { getMflSessionCookie, getMyFranchiseId } from "@/lib/mfl/session";

export default async function DashboardHome() {
  const cookie = await getMflSessionCookie();
  const myId = await getMyFranchiseId();
  const week = await getCurrentWeek({ cookie });

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
  // Your own matchup leads.
  matchups.sort(
    (a, b) =>
      Number(b.teams.some((t) => t.id === myId)) - Number(a.teams.some((t) => t.id === myId))
  );

  return (
    <>
      <PageHeader title={`Week ${week}`} />

      <section className="mfl-stack" style={{ gap: "var(--space-4)" }} aria-label="Matchups">
        <div className="mfl-section-head">
          <span className="mfl-eyebrow">Matchups</span>
          <Link href="/dashboard/scores" className="mfl-btn mfl-btn--sm">
            All scores
          </Link>
        </div>
        {matchups.length === 0 ? (
          <div className="mfl-card">
            <p className="mfl-empty">No matchups for week {week}.</p>
          </div>
        ) : (
          matchups.map((m) => <MatchupCard key={m.teams[0].id} teams={m.teams} status={m.status} week={week} />)
        )}
      </section>

      <section className="mfl-stack" style={{ gap: "var(--space-4)" }} aria-label="Standings">
        <StandingsTable rows={standings} franchises={franchises} limit={5} />
        <Link href="/dashboard/standings" className="mfl-btn mfl-btn--block">
          Full standings
        </Link>
      </section>
    </>
  );
}
