import { mflExport, toArray } from "./client";

interface WithCookie {
  cookie?: string;
}

export interface MflFranchise {
  id: string;
  name: string;
  abbrev?: string;
  icon?: string;
  logo?: string;
  division?: string;
}

export interface MflStarterPosition {
  name: string;
  /** e.g. "1-2" meaning 1 to 2 starters of this position */
  limit: string;
}

export interface MflLeagueInfo {
  name: string;
  rosterSize?: string;
  startWeek?: string;
  endWeek?: string;
  lastRegularSeasonWeek?: string;
  franchises: MflFranchise[];
  starterCount?: string;
  starterPositions: MflStarterPosition[];
}

export async function getLeague(opts: WithCookie = {}): Promise<MflLeagueInfo | null> {
  try {
    const data = await mflExport<{
      league?: {
        name?: string;
        rosterSize?: string;
        startWeek?: string;
        endWeek?: string;
        lastRegularSeasonWeek?: string;
        franchises?: { franchise?: MflFranchise | MflFranchise[] };
        starters?: { count?: string; position?: MflStarterPosition | MflStarterPosition[] };
      };
    }>("league", { cookie: opts.cookie });
    const league = data.league;
    if (!league) return null;
    return {
      name: league.name ?? "My League",
      rosterSize: league.rosterSize,
      startWeek: league.startWeek,
      endWeek: league.endWeek,
      lastRegularSeasonWeek: league.lastRegularSeasonWeek,
      franchises: toArray(league.franchises?.franchise),
      starterCount: league.starters?.count,
      starterPositions: toArray(league.starters?.position),
    };
  } catch {
    return null;
  }
}

export async function getLeagueName(opts: WithCookie = {}): Promise<string | null> {
  const league = await getLeague(opts);
  return league?.name ?? null;
}

export async function getFranchiseMap(opts: WithCookie = {}): Promise<Map<string, MflFranchise>> {
  const league = await getLeague(opts);
  const map = new Map<string, MflFranchise>();
  for (const f of league?.franchises ?? []) map.set(f.id, f);
  return map;
}

export interface MflStandingsRow {
  id: string;
  h2hw: string;
  h2hl: string;
  h2ht: string;
  h2hpct: string;
  pf: string;
  pa: string;
  strk?: string;
}

export async function getStandings(opts: WithCookie = {}): Promise<MflStandingsRow[]> {
  const data = await mflExport<{ leagueStandings?: { franchise?: MflStandingsRow | MflStandingsRow[] } }>(
    "leagueStandings",
    { cookie: opts.cookie }
  );
  const rows = toArray(data.leagueStandings?.franchise);
  return rows.sort((a, b) => {
    const pctDiff = parseFloat(b.h2hpct) - parseFloat(a.h2hpct);
    if (pctDiff !== 0) return pctDiff;
    return parseFloat(b.pf) - parseFloat(a.pf);
  });
}

export interface MflMatchupFranchise {
  id: string;
  score?: string;
  result?: string;
  isHome?: string;
  starters?: string;
}

export interface MflMatchup {
  franchise: MflMatchupFranchise[];
}

export async function getWeeklyResults(week: number, opts: WithCookie = {}): Promise<MflMatchup[]> {
  try {
    const data = await mflExport<{ weeklyResults?: { matchup?: MflMatchup | MflMatchup[] } }>(
      "weeklyResults",
      { params: { W: week }, cookie: opts.cookie }
    );
    return toArray(data.weeklyResults?.matchup).map((m) => ({
      franchise: toArray(m.franchise),
    }));
  } catch {
    return [];
  }
}

export interface MflLiveScoreFranchise {
  id: string;
  score?: string;
  gameSecondsRemaining?: string;
  playersYetToPlay?: string;
  playersCurrentlyPlaying?: string;
}

export async function getLiveScoring(
  week?: number,
  opts: WithCookie = {}
): Promise<MflLiveScoreFranchise[] | null> {
  try {
    const data = await mflExport<{
      liveScoring?: { matchup?: { franchise?: MflLiveScoreFranchise | MflLiveScoreFranchise[] } | { franchise?: MflLiveScoreFranchise | MflLiveScoreFranchise[] }[] };
    }>("liveScoring", { params: week ? { W: week } : {}, cookie: opts.cookie });
    const matchups = toArray(data.liveScoring?.matchup);
    const franchises: MflLiveScoreFranchise[] = [];
    for (const m of matchups) {
      franchises.push(...toArray(m.franchise));
    }
    return franchises;
  } catch {
    return null;
  }
}

export interface MflScheduleWeek {
  week: string;
  matchup: MflMatchup[];
}

/**
 * The NFL week MFL considers current (1-18). Falls back to the league's start
 * week, then 1, if the schedule can't be read.
 */
export async function getCurrentWeek(opts: WithCookie = {}): Promise<number> {
  try {
    const data = await mflExport<{ nflSchedule?: { week?: string } }>("nflSchedule", {
      cookie: opts.cookie,
      skipLeague: true,
    });
    const week = parseInt(data.nflSchedule?.week ?? "", 10);
    if (Number.isFinite(week)) return Math.min(Math.max(week, 1), 18);
  } catch {
    // fall through
  }
  return 1;
}

export async function getSchedule(opts: WithCookie = {}): Promise<MflScheduleWeek[]> {
  const data = await mflExport<{
    schedule?: { weeklySchedule?: { week: string; matchup?: MflMatchup | MflMatchup[] } | { week: string; matchup?: MflMatchup | MflMatchup[] }[] };
  }>("schedule", { cookie: opts.cookie });
  return toArray(data.schedule?.weeklySchedule).map((w) => ({
    week: w.week,
    matchup: toArray(w.matchup).map((m) => ({ franchise: toArray(m.franchise) })),
  }));
}

export interface MflRosterPlayer {
  id: string;
  status?: string;
}

export interface MflFranchiseRoster {
  id: string;
  player: MflRosterPlayer[];
}

export async function getRosters(opts: WithCookie = {}): Promise<MflFranchiseRoster[]> {
  const data = await mflExport<{
    rosters?: { franchise?: { id: string; player?: MflRosterPlayer | MflRosterPlayer[] } | { id: string; player?: MflRosterPlayer | MflRosterPlayer[] }[] };
  }>("rosters", { cookie: opts.cookie });
  return toArray(data.rosters?.franchise).map((f) => ({
    id: f.id,
    player: toArray(f.player),
  }));
}

export async function getFranchiseRoster(
  franchiseId: string,
  opts: WithCookie & { week?: number } = {}
): Promise<MflFranchiseRoster | null> {
  const data = await mflExport<{
    rosters?: { franchise?: { id: string; player?: MflRosterPlayer | MflRosterPlayer[] } | { id: string; player?: MflRosterPlayer | MflRosterPlayer[] }[] };
  }>("rosters", {
    params: { FRANCHISE: franchiseId, W: opts.week },
    cookie: opts.cookie,
  });
  const franchises = toArray(data.rosters?.franchise);
  const f = franchises.find((x) => x.id === franchiseId) ?? franchises[0];
  if (!f) return null;
  return { id: f.id, player: toArray(f.player) };
}

export interface MflDraftPick {
  round: string;
  pick: string;
  franchise: string;
  player: string;
  comments?: string;
}

export async function getDraftResults(opts: WithCookie = {}): Promise<MflDraftPick[]> {
  try {
    const data = await mflExport<{
      draftResults?: {
        draftUnit?: { draftPick?: MflDraftPick | MflDraftPick[] } | { draftPick?: MflDraftPick | MflDraftPick[] }[];
      };
    }>("draftResults", { cookie: opts.cookie });
    const picks = toArray(data.draftResults?.draftUnit).flatMap((u) => toArray(u.draftPick));
    return picks.sort((a, b) => {
      const roundDiff = parseInt(a.round, 10) - parseInt(b.round, 10);
      if (roundDiff !== 0) return roundDiff;
      return parseInt(a.pick, 10) - parseInt(b.pick, 10);
    });
  } catch {
    return [];
  }
}

export interface MflTransaction {
  timestamp: string;
  type: string;
  franchise: string;
  transaction?: string;
  activated?: string;
  deactivated?: string;
}

export async function getTransactions(opts: WithCookie = {}): Promise<MflTransaction[]> {
  try {
    const data = await mflExport<{ transactions?: { transaction?: MflTransaction | MflTransaction[] } }>(
      "transactions",
      { cookie: opts.cookie }
    );
    return toArray(data.transactions?.transaction).sort(
      (a, b) => parseInt(b.timestamp, 10) - parseInt(a.timestamp, 10)
    );
  } catch {
    return [];
  }
}

interface MflScoreRow {
  id: string;
  score?: string;
}

async function getScoreMap(
  type: "playerScores" | "projectedScores",
  week: number,
  opts: WithCookie
): Promise<Map<string, string>> {
  try {
    const data = await mflExport<{
      playerScores?: { playerScore?: MflScoreRow | MflScoreRow[] };
      projectedScores?: { playerScore?: MflScoreRow | MflScoreRow[] };
    }>(type, { params: { W: week }, cookie: opts.cookie });
    const rows = toArray(data[type]?.playerScore);
    return new Map(rows.filter((r) => r.score !== undefined).map((r) => [r.id, r.score as string]));
  } catch {
    return new Map();
  }
}

/** Fantasy points scored so far this week, by player id. */
export function getPlayerScores(week: number, opts: WithCookie = {}) {
  return getScoreMap("playerScores", week, opts);
}

/** Projected fantasy points for the week, by player id. */
export function getProjectedScores(week: number, opts: WithCookie = {}) {
  return getScoreMap("projectedScores", week, opts);
}

/** NFL injury designations for the week, by player id (e.g. "Questionable", "Out", "IR"). */
export async function getInjuries(week: number, opts: WithCookie = {}): Promise<Map<string, string>> {
  try {
    const data = await mflExport<{
      injuries?: { injury?: { id: string; status: string } | { id: string; status: string }[] };
    }>("injuries", { params: { W: week }, cookie: opts.cookie, skipLeague: true });
    return new Map(toArray(data.injuries?.injury).map((i) => [i.id, i.status]));
  } catch {
    return new Map();
  }
}

export interface MflNflGame {
  opponent: string;
  isHome: boolean;
  /** Unix seconds. */
  kickoff: number;
  gameSecondsRemaining: number;
}

/** This week's NFL games keyed by team code (MFL's codes, e.g. "KCC"). A team with no entry is on a bye. */
export async function getNflGames(week: number, opts: WithCookie = {}): Promise<Map<string, MflNflGame>> {
  type Team = { id: string; isHome?: string };
  type Game = { kickoff?: string; gameSecondsRemaining?: string; team?: Team | Team[] };
  const games = new Map<string, MflNflGame>();
  try {
    const data = await mflExport<{ nflSchedule?: { matchup?: Game | Game[] } }>("nflSchedule", {
      params: { W: week },
      cookie: opts.cookie,
      skipLeague: true,
    });
    for (const game of toArray(data.nflSchedule?.matchup)) {
      const teams = toArray(game.team);
      if (teams.length !== 2) continue;
      for (const [me, other] of [[teams[0], teams[1]], [teams[1], teams[0]]] as const) {
        games.set(me.id, {
          opponent: other.id,
          isHome: me.isHome === "1",
          kickoff: parseInt(game.kickoff ?? "0", 10),
          gameSecondsRemaining: parseInt(game.gameSecondsRemaining ?? "0", 10),
        });
      }
    }
  } catch {
    // no schedule: rows simply omit the matchup line
  }
  return games;
}
