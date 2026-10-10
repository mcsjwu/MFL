import type { PlayerRowData } from "@/components/mfl/PlayerRow";
import { resolvePlayers } from "./client";
import {
  displayName,
  injuryBadge,
  normalizePosition,
  playerPoints,
  positionRank,
  formatPts,
} from "./present";
import {
  getFranchiseRoster,
  getInjuries,
  getNflGames,
  getPlayerScores,
  getProjectedScores,
  type MflNflGame,
} from "./queries";

export interface RosterGroup {
  title: string;
  players: PlayerRowData[];
}

function gameLine(team: string | undefined, game: MflNflGame | undefined): string {
  if (!team) return "";
  if (!game) return `${team} · Bye`;
  const vs = `${game.isHome ? "vs" : "@"} ${game.opponent}`;
  const now = Date.now() / 1000;
  if (game.kickoff > now) {
    const when = new Date(game.kickoff * 1000).toLocaleString("en-US", {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/New_York",
    });
    // Non-breaking spaces keep "Sun 1:00 PM ET" on one line when the row wraps.
    return `${team} · ${vs} · ${when.replace(/ /g, "\u00a0")}\u00a0ET`;
  }
  return `${team} · ${vs} · ${game.gameSecondsRemaining > 0 ? "In progress" : "Final"}`;
}

/**
 * A franchise's roster for a week, grouped the way a manager reads it:
 * starters, bench, injured reserve, taxi squad. Before a lineup is set it is one "Roster" group.
 */
export async function getRosterView(params: {
  franchiseId: string;
  week: number;
  currentWeek: number;
  cookie?: string;
}): Promise<RosterGroup[]> {
  const { franchiseId, week, currentWeek, cookie } = params;
  const roster = await getFranchiseRoster(franchiseId, { cookie, week });
  if (!roster) return [];

  const [players, scores, projections, injuries, games] = await Promise.all([
    resolvePlayers(roster.player.map((p) => p.id)),
    getPlayerScores(week, { cookie }),
    getProjectedScores(week, { cookie }),
    getInjuries(week, { cookie }),
    getNflGames(week, { cookie }),
  ]);
  const isCurrent = week === currentWeek;

  const rows = roster.player.map((rp) => {
    const info = players.get(rp.id);
    const proj = projections.get(rp.id);
    const row: PlayerRowData = {
      id: rp.id,
      name: displayName(info?.name, `Player #${rp.id}`),
      position: normalizePosition(info?.position),
      sub: gameLine(info?.team, info?.team ? games.get(info.team) : undefined),
      badge: injuryBadge(injuries.get(rp.id)),
      pts: playerPoints(scores.get(rp.id), isCurrent),
      proj: proj !== undefined ? formatPts(proj) : undefined,
    };
    return { status: (rp.status ?? "ROSTER").toUpperCase(), row };
  });

  rows.sort(
    (a, b) =>
      positionRank(a.row.position) - positionRank(b.row.position) || a.row.name.localeCompare(b.row.name)
  );

  const hasLineup = rows.some((r) => r.status === "STARTER");
  const pick = (...statuses: string[]) => rows.filter((r) => statuses.includes(r.status)).map((r) => r.row);

  const groups: RosterGroup[] = hasLineup
    ? [
        { title: "Starters", players: pick("STARTER") },
        { title: "Bench", players: pick("NONSTARTER", "ROSTER") },
      ]
    : [{ title: "Roster", players: pick("NONSTARTER", "ROSTER", "STARTER") }];

  groups.push(
    { title: "Injured reserve", players: pick("INJURED_RESERVE") },
    { title: "Taxi squad", players: pick("TAXI_SQUAD") }
  );
  return groups.filter((g) => g.players.length > 0);
}

export interface LineupPlayer {
  id: string;
  name: string;
  position: string;
  sub: string;
  badge: PlayerRowData["badge"];
  proj?: string;
}

/** Everything the lineup editor needs for one week: the roster and who is currently set to start. */
export async function getLineupView(params: {
  franchiseId: string;
  week: number;
  cookie?: string;
}): Promise<{ players: LineupPlayer[]; initialStarters: string[] }> {
  const { franchiseId, week, cookie } = params;
  const roster = await getFranchiseRoster(franchiseId, { cookie, week });
  if (!roster) return { players: [], initialStarters: [] };

  const [info, projections, injuries, games] = await Promise.all([
    resolvePlayers(roster.player.map((p) => p.id)),
    getProjectedScores(week, { cookie }),
    getInjuries(week, { cookie }),
    getNflGames(week, { cookie }),
  ]);

  // Only active-roster players can start: IR and taxi squad are excluded.
  const active = roster.player.filter((p) => {
    const s = (p.status ?? "ROSTER").toUpperCase();
    return s !== "INJURED_RESERVE" && s !== "TAXI_SQUAD";
  });

  const players = active
    .map((rp): LineupPlayer => {
      const p = info.get(rp.id);
      const proj = projections.get(rp.id);
      return {
        id: rp.id,
        name: displayName(p?.name, `Player #${rp.id}`),
        position: normalizePosition(p?.position) || "—",
        sub: gameLine(p?.team, p?.team ? games.get(p.team) : undefined),
        badge: injuryBadge(injuries.get(rp.id)),
        proj: proj !== undefined ? formatPts(proj) : undefined,
      };
    })
    .sort((a, b) => positionRank(a.position) - positionRank(b.position) || a.name.localeCompare(b.name));

  const initialStarters = active
    .filter((p) => (p.status ?? "").toUpperCase() === "STARTER")
    .map((p) => p.id);
  return { players, initialStarters };
}
