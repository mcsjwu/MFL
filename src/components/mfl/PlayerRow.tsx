import PositionBadge from "./PositionBadge";
import type { StatusBadge } from "@/lib/mfl/present";

export interface PlayerRowData {
  id: string;
  name: string;
  position?: string;
  /** Secondary line: NFL team and anything else worth a glance. */
  sub?: string;
  badge?: StatusBadge | null;
  /** Already formatted: one decimal, or an em dash while pending. */
  pts?: string;
  proj?: string;
}

/** One roster slot: position, player, points. Numbers lead. */
export default function PlayerRow({ player }: { player: PlayerRowData }) {
  return (
    <li className="mfl-player">
      <PositionBadge position={player.position} />
      <div className="mfl-player__main">
        <div className="mfl-player__name">
          <span>{player.name}</span>
          {player.badge && <span className={`mfl-badge mfl-badge--${player.badge.tone}`}>{player.badge.label}</span>}
        </div>
        {player.sub && <div className="mfl-player__sub">{player.sub}</div>}
      </div>
      {(player.pts || player.proj) && (
        <div className="mfl-player__pts">
          {player.pts && <strong>{player.pts}</strong>}
          {player.proj && <span>Proj. {player.proj}</span>}
        </div>
      )}
    </li>
  );
}
