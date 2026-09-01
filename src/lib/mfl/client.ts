import { MFL_API_HOST, MFL_LEAGUE_ID, MFL_YEAR } from "./config";

export class MflApiError extends Error {}
export class MflAuthError extends Error {}

export interface MflLoginResult {
  cookieName: string;
  cookieValue: string;
}

/**
 * Logs a user in against the MFL login API and returns the session cookie
 * (name + value) to store. MFL's docs specify the cookie name is dynamic,
 * but in practice it's always MFL_USER_ID.
 */
export async function mflLogin(
  username: string,
  password: string,
  year: string = MFL_YEAR
): Promise<MflLoginResult> {
  const url = `https://${MFL_API_HOST}/${year}/login?USERNAME=${encodeURIComponent(
    username
  )}&PASSWORD=${encodeURIComponent(password)}&XML=1`;

  const res = await fetch(url, { method: "GET", cache: "no-store" });
  const text = await res.text();

  const statusMatch = text.match(/<status\s+([A-Z0-9_]+)="([^"]*)">\s*OK\s*<\/status>/i);
  if (statusMatch) {
    return { cookieName: statusMatch[1], cookieValue: statusMatch[2] };
  }

  const errorMatch = text.match(/<error>([^<]*)<\/error>/i);
  throw new MflAuthError(errorMatch?.[1]?.trim() || "Login failed");
}

interface MflExportOptions {
  /** "NAME=VALUE" cookie string, e.g. from getMflSessionCookie() */
  cookie?: string;
  year?: string;
  /** Extra query params beyond TYPE/L/JSON */
  params?: Record<string, string | number | undefined>;
  /** Some TYPEs (e.g. "players") aren't league-scoped; skip the default L param */
  skipLeague?: boolean;
}

/**
 * Calls the MFL export API for the configured league. `api.myfantasyleague.com`
 * 302-redirects to the league's actual host based on the L param, which
 * fetch() follows automatically, so we never need to hardcode a host.
 */
export async function mflExport<T = unknown>(
  type: string,
  options: MflExportOptions = {}
): Promise<T> {
  const year = options.year ?? MFL_YEAR;
  const search = new URLSearchParams({ TYPE: type, JSON: "1" });

  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined) search.set(key, String(value));
    }
  }
  if (!options.skipLeague && !search.has("L")) search.set("L", MFL_LEAGUE_ID);

  const url = `https://${MFL_API_HOST}/${year}/export?${search.toString()}`;
  const headers: Record<string, string> = {};
  if (options.cookie) headers["Cookie"] = options.cookie;

  const res = await fetch(url, { headers, redirect: "follow", cache: "no-store" });
  if (!res.ok) {
    throw new MflApiError(`MFL export ${type} failed with HTTP ${res.status}`);
  }

  const data = (await res.json()) as Record<string, unknown>;
  if (data.error) {
    const err = data.error;
    const message = typeof err === "string" ? err : (err as { $t?: string }).$t ?? "MFL API error";
    throw new MflApiError(message);
  }

  return data as T;
}

export interface MflPlayer {
  id: string;
  name: string;
  position?: string;
  team?: string;
}

const playerCache = new Map<string, MflPlayer>();

/**
 * Resolves player IDs to name/position/team, using an in-memory cache
 * (MFL's player DB changes at most once a day per their API terms).
 */
export async function resolvePlayers(ids: string[]): Promise<Map<string, MflPlayer>> {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  const missing = unique.filter((id) => !playerCache.has(id));

  if (missing.length > 0) {
    const data = await mflExport<{
      players?: { player?: MflPlayer | MflPlayer[] };
    }>("players", { params: { PLAYERS: missing.join(",") }, skipLeague: true });

    const raw = data.players?.player;
    const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
    for (const p of list) {
      playerCache.set(p.id, p);
    }
  }

  const result = new Map<string, MflPlayer>();
  for (const id of unique) {
    const player = playerCache.get(id);
    if (player) result.set(id, player);
  }
  return result;
}

/** MFL's JSON API returns a bare object for a single item, or an array for many. Normalize to an array. */
export function toArray<T>(x: T | T[] | undefined | null): T[] {
  if (x === undefined || x === null) return [];
  return Array.isArray(x) ? x : [x];
}

export interface MflMyLeague {
  id: string;
  name?: string;
  franchise_id?: string;
  franchise_name?: string;
  url?: string;
}

/** Looks up the logged-in user's franchise id for the configured league. */
export async function findMyFranchiseId(
  cookie: string,
  leagueId: string = MFL_LEAGUE_ID,
  year: string = MFL_YEAR
): Promise<MflMyLeague | undefined> {
  const data = await mflExport<{ leagues?: { league?: MflMyLeague | MflMyLeague[] } }>(
    "myleagues",
    { cookie, year, skipLeague: true }
  );
  const leagues = toArray(data.leagues?.league);
  return leagues.find((l) => l.id === leagueId);
}

export function formatPlayerName(player: MflPlayer | undefined, fallbackId: string): string {
  if (!player) return `Player #${fallbackId}`;
  const parts = [player.name];
  if (player.position || player.team) {
    parts.push(`(${[player.position, player.team].filter(Boolean).join(" - ")})`);
  }
  return parts.join(" ");
}
