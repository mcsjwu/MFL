import PageHeader from "@/components/mfl/PageHeader";
import PlayerRow from "@/components/mfl/PlayerRow";
import { resolvePlayers } from "@/lib/mfl/client";
import { displayName, normalizePosition } from "@/lib/mfl/present";
import { getDraftResults, getFranchiseMap } from "@/lib/mfl/queries";
import { getMflSessionCookie } from "@/lib/mfl/session";

export default async function DraftPage() {
  const cookie = await getMflSessionCookie();
  const [franchises, picks] = await Promise.all([getFranchiseMap({ cookie }), getDraftResults({ cookie })]);
  const players = await resolvePlayers(picks.map((p) => p.player));

  const rounds = new Map<number, typeof picks>();
  for (const pick of picks) {
    const round = parseInt(pick.round, 10);
    rounds.set(round, [...(rounds.get(round) ?? []), pick]);
  }

  return (
    <>
      <PageHeader title="Draft" sub={picks.length > 0 ? `${picks.length} picks` : undefined} />

      {[...rounds.entries()].map(([round, roundPicks]) => (
        <div key={round} className="mfl-card">
          <h2 className="mfl-card__head">Round {round}</h2>
          <ul className="mfl-players">
            {roundPicks.map((pick) => {
              const info = players.get(pick.player);
              return (
                <PlayerRow
                  key={`${pick.round}-${pick.pick}`}
                  player={{
                    id: pick.player,
                    name: displayName(info?.name, `Player #${pick.player}`),
                    position: normalizePosition(info?.position),
                    sub: franchises.get(pick.franchise)?.name?.trim() ?? pick.franchise,
                    pts: `${round}.${pick.pick}`,
                  }}
                />
              );
            })}
          </ul>
        </div>
      ))}

      {picks.length === 0 && (
        <div className="mfl-card">
          <p className="mfl-empty">No draft results yet.</p>
        </div>
      )}
    </>
  );
}
