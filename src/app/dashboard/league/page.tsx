import Monogram from "@/components/mfl/Monogram";
import PageHeader from "@/components/mfl/PageHeader";
import { MFL_LEAGUE_ID, MFL_YEAR } from "@/lib/mfl/config";
import { DASH } from "@/lib/mfl/present";
import { getLeague } from "@/lib/mfl/queries";
import { getMflSessionCookie } from "@/lib/mfl/session";

const range = (limit: string) => limit.replace("-", "–");

export default async function LeagueInfoPage() {
  const cookie = await getMflSessionCookie();
  const league = await getLeague({ cookie });

  const tiles = [
    { label: "Roster size", value: league?.rosterSize },
    { label: "Starters", value: league?.starterCount },
    { label: "First week", value: league?.startWeek },
    { label: "Last regular week", value: league?.lastRegularSeasonWeek },
  ];

  return (
    <>
      <PageHeader title="League info" sub={`${league?.name ?? "League"} · ${MFL_YEAR} · #${MFL_LEAGUE_ID}`} />

      <div className="mfl-card">
        <h2 className="mfl-card__head">Settings</h2>
        <ul className="mfl-tiles" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {tiles.map((t) => (
            <li key={t.label} className="mfl-tile">
              <span className="mfl-eyebrow">{t.label}</span>
              <span className="mfl-stat">{t.value ?? DASH}</span>
            </li>
          ))}
        </ul>
      </div>

      {(league?.starterPositions.length ?? 0) > 0 && (
        <div className="mfl-card">
          <h2 className="mfl-card__head">Starting lineup</h2>
          <ul className="mfl-rows">
            {league?.starterPositions.map((p) => (
              <li key={p.name} className="mfl-row">
                <span className="mfl-row__main">
                  <span className="mfl-row__title">{p.name}</span>
                </span>
                <span className="mfl-row__end mfl-stat">{range(p.limit)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mfl-card">
        <h2 className="mfl-card__head">Teams</h2>
        {(league?.franchises.length ?? 0) === 0 ? (
          <p className="mfl-empty">No teams found.</p>
        ) : (
          <ul className="mfl-rows">
            {league?.franchises.map((f) => (
              <li key={f.id} className="mfl-row">
                <Monogram name={f.name} small />
                <span className="mfl-row__main">
                  <span className="mfl-row__title">{f.name.trim()}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
