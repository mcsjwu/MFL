# MFL Dashboard

A Next.js app for a MyFantasyLeague (MFL) fantasy football league: standings, live/weekly scores,
rosters, your own team, schedule, draft results, transactions, and league info.

## How it talks to MFL

MyFantasyLeague exposes a free JSON API at `api.myfantasyleague.com`. Requests scoped to a league
(`L=<leagueId>`) are auto-redirected to that league's actual host, so no host needs to be
hardcoded. Private league data requires a per-user session, obtained by calling MFL's `login`
endpoint with a username/password and sending the resulting `MFL_USER_ID` cookie back on
subsequent requests — see `src/lib/mfl/client.ts`.

- `src/lib/mfl/config.ts` — league id / season year / cookie names, overridable via env vars.
- `src/lib/mfl/client.ts` — low-level MFL API client: login, export, player-name resolution
  (with an in-memory cache, since MFL's player DB changes at most once a day).
- `src/lib/mfl/session.ts` — reads/writes the httpOnly session cookie for the logged-in user.
- `src/lib/mfl/queries.ts` — typed helpers for each MFL data type used by the dashboard
  (standings, rosters, schedule, draft results, transactions, ...).
- `src/proxy.ts` — redirects unauthenticated requests away from `/dashboard/*` to `/login`.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`. Sign in
with your MyFantasyLeague username and password; credentials are sent straight to MFL to obtain a
session token and are never stored by this app.

## Configuration

Set these in `.env.local` (see `.env.example`) to point at your own league:

```bash
MFL_YEAR=2026
MFL_LEAGUE_ID=53286
```

## Notes

- Lineup/roster editing (a write operation against MFL) isn't implemented yet — everything here is
  read-only.
- "My Team" is resolved automatically after login via MFL's `myleagues` API; if that lookup fails
  you can still browse any team's roster from the Rosters page.
