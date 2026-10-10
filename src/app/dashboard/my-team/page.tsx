import Link from "next/link";
import PageHeader from "@/components/mfl/PageHeader";
import RosterCards from "@/components/mfl/RosterCards";
import { standingsLookup } from "@/lib/mfl/matchups";
import { getCurrentWeek, getFranchiseMap, getStandings } from "@/lib/mfl/queries";
import { getRosterView } from "@/lib/mfl/roster";
import { getMflSessionCookie, getMyFranchiseId } from "@/lib/mfl/session";

export default async function MyTeamPage() {
  const cookie = await getMflSessionCookie();
  const franchiseId = await getMyFranchiseId();

  if (!franchiseId) {
    return (
      <>
        <PageHeader title="My team" />
        <div className="mfl-card">
          <p className="mfl-empty">
            We couldn&apos;t tell which team is yours in this league. Open any team from{" "}
            <Link href="/dashboard/rosters" style={{ color: "var(--accent)" }}>
              Rosters
            </Link>
            .
          </p>
        </div>
      </>
    );
  }

  const week = await getCurrentWeek({ cookie });
  const [franchises, standings, groups] = await Promise.all([
    getFranchiseMap({ cookie }),
    getStandings({ cookie }),
    getRosterView({ franchiseId, week, currentWeek: week, cookie }),
  ]);
  const name = franchises.get(franchiseId)?.name?.trim() ?? "My team";
  const record = standingsLookup(standings).get(franchiseId)?.record;

  return (
    <>
      <PageHeader title={name} sub={record ? `${record} · Week ${week}` : `Week ${week}`} />
      <Link href="/dashboard/lineup" className="mfl-btn mfl-btn--accent mfl-btn--block">
        Set lineup
      </Link>
      <RosterCards groups={groups} />
    </>
  );
}
