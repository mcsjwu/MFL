import Monogram from "@/components/mfl/Monogram";
import PageHeader from "@/components/mfl/PageHeader";
import { getCurrentWeek, getFranchiseMap, getSchedule, type MflMatchup } from "@/lib/mfl/queries";
import { getMflSessionCookie, getMyFranchiseId } from "@/lib/mfl/session";

function WeekCard({
  week,
  matchups,
  franchises,
  myId,
}: {
  week: string;
  matchups: MflMatchup[];
  franchises: Map<string, { name: string }>;
  myId: string | undefined;
}) {
  const name = (id: string) => franchises.get(id)?.name?.trim() ?? id;
  return (
    <div className="mfl-card">
      <h3 className="mfl-card__head">Week {week}</h3>
      <ul className="mfl-rows">
        {matchups.map((m, i) => {
          // The away team is listed first; the home team is flagged isHome.
          const [first, second] = [...m.franchise].sort((a, b) => Number(a.isHome === "1") - Number(b.isHome === "1"));
          if (!first || !second) return null;
          const mine = [first.id, second.id].includes(myId ?? "");
          return (
            <li key={i} className="mfl-row">
              <Monogram name={name(first.id)} small />
              <span className="mfl-row__main">
                <span className="mfl-row__title">{name(first.id)}</span>
                <span className="mfl-row__sub">at {name(second.id)}</span>
              </span>
              {mine && <span className="mfl-badge mfl-badge--final">You</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default async function SchedulePage() {
  const cookie = await getMflSessionCookie();
  const myId = await getMyFranchiseId();
  const [franchises, weeks, current] = await Promise.all([
    getFranchiseMap({ cookie }),
    getSchedule({ cookie }),
    getCurrentWeek({ cookie }),
  ]);

  const upcoming = weeks.filter((w) => Number(w.week) >= current);
  const played = weeks.filter((w) => Number(w.week) < current).reverse();

  return (
    <>
      <PageHeader title="Schedule" />
      {weeks.length === 0 && (
        <div className="mfl-card">
          <p className="mfl-empty">The schedule isn&apos;t available yet.</p>
        </div>
      )}
      {upcoming.length > 0 && <span className="mfl-eyebrow">Upcoming</span>}
      {upcoming.map((w) => (
        <WeekCard key={w.week} week={w.week} matchups={w.matchup} franchises={franchises} myId={myId} />
      ))}
      {played.length > 0 && <span className="mfl-eyebrow">Played</span>}
      {played.map((w) => (
        <WeekCard key={w.week} week={w.week} matchups={w.matchup} franchises={franchises} myId={myId} />
      ))}
    </>
  );
}
