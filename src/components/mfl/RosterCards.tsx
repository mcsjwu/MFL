import PlayerRow from "./PlayerRow";
import type { RosterGroup } from "@/lib/mfl/roster";

export default function RosterCards({ groups }: { groups: RosterGroup[] }) {
  if (groups.length === 0) {
    return (
      <div className="mfl-card">
        <p className="mfl-empty">No roster data available.</p>
      </div>
    );
  }
  return (
    <>
      {groups.map((group) => (
        <div key={group.title} className="mfl-card">
          <h2 className="mfl-card__head">{group.title}</h2>
          <ul className="mfl-players">
            {group.players.map((p) => (
              <PlayerRow key={p.id} player={p} />
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
