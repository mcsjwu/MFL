"use client";

import { useMemo, useState } from "react";

interface RosterPlayer {
  id: string;
  name: string;
  position: string;
  team: string;
}

interface StarterPosition {
  name: string;
  limit: string;
}

interface Props {
  week: number;
  players: RosterPlayer[];
  starterCount?: string;
  starterPositions: StarterPosition[];
  initialStarters: string[];
}

function parseLimit(limit: string): { min: number; max: number } {
  const [min, max] = limit.split("-").map((n) => parseInt(n, 10));
  return { min: min || 0, max: max ?? min ?? 0 };
}

export default function LineupEditor({
  week,
  players,
  starterCount,
  starterPositions,
  initialStarters,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialStarters));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const playersByPosition = useMemo(() => {
    const map = new Map<string, RosterPlayer[]>();
    for (const p of players) {
      const list = map.get(p.position) ?? [];
      list.push(p);
      map.set(p.position, list);
    }
    return map;
  }, [players]);

  const namedPositions = new Set(starterPositions.map((p) => p.name));
  const otherPlayers = players.filter((p) => !namedPositions.has(p.position));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const requiredTotal = starterCount ? parseInt(starterCount, 10) : undefined;
  const totalOk = requiredTotal === undefined || selected.size === requiredTotal;

  const positionCounts = starterPositions.map((pos) => {
    const count = (playersByPosition.get(pos.name) ?? []).filter((p) => selected.has(p.id)).length;
    const { min, max } = parseLimit(pos.limit);
    return { ...pos, count, min, max, ok: count >= min && count <= max };
  });
  const allPositionsOk = positionCounts.every((p) => p.ok);
  const canSubmit = totalOk && allPositionsOk && !saving;

  async function handleSubmit() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/lineup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week, starters: [...selected] }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to submit lineup" });
        return;
      }
      setMessage({ type: "success", text: `Lineup saved for week ${week}.` });
    } catch {
      setMessage({ type: "error", text: "Network error, please try again" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-3 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 text-sm">
        <span
          className={`font-medium ${totalOk ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}
        >
          Starters: {selected.size}
          {requiredTotal !== undefined ? ` / ${requiredTotal}` : ""}
        </span>
        {positionCounts.map((p) => (
          <span
            key={p.name}
            className={p.ok ? "text-neutral-500" : "text-amber-600 dark:text-amber-400 font-medium"}
          >
            {p.name}: {p.count} ({p.min}-{p.max})
          </span>
        ))}
      </div>

      {starterPositions.map((pos) => (
        <section key={pos.name} className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-neutral-500">
            {pos.name} <span className="font-normal">(need {pos.limit})</span>
          </h2>
          <PlayerList
            players={playersByPosition.get(pos.name) ?? []}
            selected={selected}
            onToggle={toggle}
          />
        </section>
      ))}

      {otherPlayers.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-neutral-500">Other</h2>
          <PlayerList players={otherPlayers} selected={selected} onToggle={toggle} />
        </section>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          {saving ? "Saving…" : `Save lineup for week ${week}`}
        </button>
        {message && (
          <span
            className={`text-sm ${message.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          >
            {message.text}
          </span>
        )}
      </div>
    </div>
  );
}

function PlayerList({
  players,
  selected,
  onToggle,
}: {
  players: RosterPlayer[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  if (players.length === 0) {
    return <p className="text-sm text-neutral-400">No eligible players on your roster.</p>;
  }
  return (
    <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
      {players.map((p) => (
        <label
          key={p.id}
          className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors ${
            selected.has(p.id)
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
              : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900"
          }`}
        >
          <input
            type="checkbox"
            checked={selected.has(p.id)}
            onChange={() => onToggle(p.id)}
            className="accent-blue-600"
          />
          <span>
            {p.name}
            {p.team && <span className="text-neutral-400"> ({p.team})</span>}
          </span>
        </label>
      ))}
    </div>
  );
}
