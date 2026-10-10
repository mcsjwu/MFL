import Monogram from "./Monogram";
import { gamesBehind } from "@/lib/mfl/matchups";
import { formatPts } from "@/lib/mfl/present";
import type { MflFranchise, MflStandingsRow } from "@/lib/mfl/queries";

/** Standings in a glass card. Columns W, L (and T when anyone has tied), PF, GB. */
export default function StandingsTable({
  rows,
  franchises,
  title = "Standings",
  limit,
}: {
  rows: MflStandingsRow[];
  franchises: Map<string, MflFranchise>;
  title?: string;
  limit?: number;
}) {
  const shown = limit ? rows.slice(0, limit) : rows;
  const leader = rows[0];
  const hasTies = rows.some((r) => Number(r.h2ht) > 0);

  return (
    <div className="mfl-card">
      <h2 className="mfl-card__head">{title}</h2>
      {shown.length === 0 ? (
        <p className="mfl-empty">Standings aren&apos;t available yet.</p>
      ) : (
        <div className="mfl-tablewrap">
          <table className="mfl-table">
            <thead>
              <tr>
                <th scope="col">Team</th>
                <th scope="col">W</th>
                <th scope="col">L</th>
                {hasTies && <th scope="col">T</th>}
                <th scope="col">PF</th>
                <th scope="col">GB</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((row) => {
                const name = franchises.get(row.id)?.name?.trim() ?? row.id;
                return (
                  <tr key={row.id}>
                    <td>
                      <div className="mfl-team">
                        <Monogram name={name} small />
                        {name}
                      </div>
                    </td>
                    <td>{row.h2hw}</td>
                    <td>{row.h2hl}</td>
                    {hasTies && <td>{row.h2ht}</td>}
                    <td>{formatPts(row.pf)}</td>
                    <td>{gamesBehind(leader, row)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
