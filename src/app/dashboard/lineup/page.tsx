import Link from "next/link";
import ChipRow from "@/components/mfl/ChipRow";
import PageHeader from "@/components/mfl/PageHeader";
import { getCurrentWeek, getFranchiseMap, getLeague } from "@/lib/mfl/queries";
import { getLineupView } from "@/lib/mfl/roster";
import { getMflSessionCookie, getMyFranchiseId } from "@/lib/mfl/session";
import LineupEditor from "./LineupEditor";

const WEEKS = Array.from({ length: 18 }, (_, i) => i + 1);

export default async function LineupPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const cookie = await getMflSessionCookie();
  const franchiseId = await getMyFranchiseId();

  if (!franchiseId) {
    return (
      <>
        <PageHeader title="Set lineup" />
        <div className="mfl-card">
          <p className="mfl-empty">
            We couldn&apos;t tell which team is yours in this league, so there&apos;s no roster to edit. Sign
            out and back in with the login that manages your team.
          </p>
        </div>
      </>
    );
  }

  const { week: weekParam } = await searchParams;
  const current = await getCurrentWeek({ cookie });
  const requested = parseInt(weekParam ?? "", 10);
  const week = Math.min(Math.max(Number.isFinite(requested) ? requested : current, 1), 18);

  const [league, franchises, view] = await Promise.all([
    getLeague({ cookie }),
    getFranchiseMap({ cookie }),
    getLineupView({ franchiseId, week, cookie }),
  ]);

  return (
    <>
      <PageHeader
        title="Set lineup"
        sub={`${franchises.get(franchiseId)?.name?.trim() ?? "My team"} · Week ${week}`}
      />

      <ChipRow label="Week">
        {WEEKS.map((w) => (
          <Link
            key={w}
            href={`/dashboard/lineup?week=${w}`}
            className="mfl-btn mfl-btn--sm"
            aria-label={`Week ${w}`}
            aria-current={w === week ? "true" : undefined}
          >
            {w}
          </Link>
        ))}
      </ChipRow>

      {view.players.length === 0 ? (
        <div className="mfl-card">
          <p className="mfl-empty">No roster data available for this week.</p>
        </div>
      ) : (
        <LineupEditor
          // Remount when the week changes so the selection resets to that week's lineup.
          key={week}
          week={week}
          players={view.players}
          starterCount={league?.starterCount}
          starterPositions={league?.starterPositions ?? []}
          initialStarters={view.initialStarters}
        />
      )}
    </>
  );
}
