import Monogram from "./Monogram";
import { DASH, formatPts } from "@/lib/mfl/present";

export type MatchupStatus = "upcoming" | "live" | "inprogress" | "final";

export interface MatchupTeam {
  id: string;
  name: string;
  record?: string;
  seed?: number;
  score?: number;
}

function Name({ team }: { team: MatchupTeam }) {
  return (
    <div className="mfl-matchup__name">
      {team.seed !== undefined && <span className="mfl-matchup__seed">{team.seed}</span>}
      {team.name}
    </div>
  );
}

/** Head-to-head card. Upcoming shows "vs"; live, in progress and final lead with the totals. */
export default function MatchupCard({
  teams,
  status,
  week,
}: {
  teams: [MatchupTeam, MatchupTeam];
  status: MatchupStatus;
  week: number;
}) {
  const [a, b] = teams;

  if (status === "upcoming") {
    return (
      <div className="mfl-card mfl-matchup">
        <div className="mfl-eyebrow mfl-matchup__sub">Week {week}</div>
        <div className="mfl-matchup__row">
          <div className="mfl-matchup__team">
            <Monogram name={a.name} />
            <Name team={a} />
            {a.record && <div className="mfl-matchup__rec">{a.record}</div>}
          </div>
          <div className="mfl-matchup__mid">
            <div className="mfl-matchup__time">vs</div>
          </div>
          <div className="mfl-matchup__team">
            <Monogram name={b.name} />
            <Name team={b} />
            {b.record && <div className="mfl-matchup__rec">{b.record}</div>}
          </div>
        </div>
      </div>
    );
  }

  const sa = a.score ?? 0;
  const sb = b.score ?? 0;
  const margin = Math.abs(sa - sb);
  const aLeads = sa > sb;
  const bLeads = sb > sa;
  const showDelta = status === "final" && margin > 0;

  return (
    <div className="mfl-card mfl-matchup">
      <div style={{ display: "flex", justifyContent: "center" }}>
        {status === "live" ? (
          <span className="mfl-badge mfl-badge--live">
            <span className="mfl-dot" />
            Live
          </span>
        ) : (
          <span className="mfl-badge mfl-badge--final">{status === "final" ? "Final" : "In progress"}</span>
        )}
      </div>
      <div className="mfl-matchup__row" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {([[a, aLeads, bLeads], [b, bLeads, aLeads]] as const).map(([team, leads, trails]) => (
          <div key={team.id} className="mfl-matchup__team">
            <div className={`mfl-matchup__score${trails ? " mfl-matchup__score--lose" : ""}`}>
              {team.score && team.score > 0 ? formatPts(team.score) : DASH}
            </div>
            <Name team={team} />
            {showDelta && leads && <span className="mfl-delta mfl-delta--up">▲ +{margin.toFixed(1)}</span>}
            {showDelta && trails && <span className="mfl-delta mfl-delta--down">▼ −{margin.toFixed(1)}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
