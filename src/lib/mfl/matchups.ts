import type { MatchupStatus, MatchupTeam } from "@/components/mfl/MatchupCard";
import { formatRecord } from "./present";
import type {
  MflFranchise,
  MflLiveScoreFranchise,
  MflMatchup,
  MflStandingsRow,
} from "./queries";

export interface MatchupView {
  teams: [MatchupTeam, MatchupTeam];
  status: MatchupStatus;
}

function num(value: string | undefined): number | undefined {
  if (value === undefined || value === "") return undefined;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Standings tell us record and seed. Seeds are only meaningful once someone
 * has played, so before that we leave them off rather than show an arbitrary order.
 */
export function standingsLookup(standings: MflStandingsRow[]) {
  const played = standings.some((r) => Number(r.h2hw) + Number(r.h2hl) + Number(r.h2ht) > 0);
  const byId = new Map<string, { record: string; seed?: number }>();
  standings.forEach((row, i) => {
    byId.set(row.id, {
      record: formatRecord(row.h2hw, row.h2hl, row.h2ht),
      seed: played ? i + 1 : undefined,
    });
  });
  return byId;
}

/**
 * Combine posted results (weeklyResults) with live scoring for one week.
 *  - nothing scored and nobody playing → upcoming
 *  - someone playing right now → live
 *  - scored, players still to play → in progress
 *  - scored, nobody left → final
 */
export function buildMatchups(params: {
  matchups: MflMatchup[];
  franchises: Map<string, MflFranchise>;
  standings: Map<string, { record: string; seed?: number }>;
  live: MflLiveScoreFranchise[] | null;
}): MatchupView[] {
  const liveById = new Map((params.live ?? []).map((f) => [f.id, f]));

  return params.matchups
    .filter((m) => m.franchise.length >= 2)
    .map((m) => {
      const [fa, fb] = m.franchise;
      const make = (f: typeof fa): MatchupTeam => {
        const st = params.standings.get(f.id);
        return {
          id: f.id,
          name: params.franchises.get(f.id)?.name?.trim() ?? f.id,
          record: st?.record,
          seed: st?.seed,
          score: num(liveById.get(f.id)?.score) ?? num(f.score),
        };
      };
      const teams: [MatchupTeam, MatchupTeam] = [make(fa), make(fb)];

      const liveInfo = [fa, fb].map((f) => liveById.get(f.id));
      const playing = liveInfo.some((l) => Number(l?.playersCurrentlyPlaying) > 0);
      const toPlay = liveInfo.some((l) => Number(l?.playersYetToPlay) > 0);
      const hasScores = teams.some((t) => (t.score ?? 0) > 0);

      let status: MatchupStatus;
      if (playing) status = "live";
      else if (!hasScores) status = "upcoming";
      else if (toPlay) status = "inprogress";
      else status = "final";

      return { teams, status };
    });
}

/** Games behind the leader, in half-game steps. */
export function gamesBehind(leader: MflStandingsRow, row: MflStandingsRow): string {
  const gb = (Number(leader.h2hw) - Number(row.h2hw) + (Number(row.h2hl) - Number(leader.h2hl))) / 2;
  return gb <= 0 ? "–" : Number.isInteger(gb) ? String(gb) : gb.toFixed(1);
}
