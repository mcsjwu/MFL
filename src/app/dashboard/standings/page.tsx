import PageHeader from "@/components/mfl/PageHeader";
import StandingsTable from "@/components/mfl/StandingsTable";
import { getFranchiseMap, getStandings } from "@/lib/mfl/queries";
import { getMflSessionCookie } from "@/lib/mfl/session";

export default async function StandingsPage() {
  const cookie = await getMflSessionCookie();
  const [franchises, standings] = await Promise.all([
    getFranchiseMap({ cookie }),
    getStandings({ cookie }),
  ]);

  return (
    <>
      <PageHeader title="Standings" />
      <StandingsTable rows={standings} franchises={franchises} title="League" />
    </>
  );
}
