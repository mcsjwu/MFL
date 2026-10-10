"use client";

import { useMemo, useState } from "react";
import Icon from "@/components/mfl/Icon";
import PositionBadge from "@/components/mfl/PositionBadge";

interface Player {
  id: string;
  name: string;
  position: string;
  sub: string;
  badge?: { label: string; tone: "q" | "out" } | null;
  proj?: string;
}

interface StarterPosition {
  name: string;
  /** e.g. "1-2": between 1 and 2 starters at this position */
  limit: string;
}

interface Props {
  week: number;
  players: Player[];
  starterCount?: string;
  starterPositions: StarterPosition[];
  initialStarters: string[];
}

function parseLimit(limit: string): { min: number; max: number } {
  const [min, max] = limit.split("-").map((n) => parseInt(n, 10));
  return { min: min || 0, max: max ?? min ?? 0 };
}

const normalize = (pos: string) => (pos.toUpperCase() === "PK" ? "K" : pos.toUpperCase());
const range = (min: number, max: number) => (min === max ? `${min}` : `${min}–${max}`);

export default function LineupEditor({ week, players, starterCount, starterPositions, initialStarters }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialStarters));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const rules = useMemo(
    () =>
      starterPositions.map((p) => ({ name: normalize(p.name), ...parseLimit(p.limit) })),
    [starterPositions]
  );

  // Groups follow the league's starting positions, then anything else on the roster.
  const groups = useMemo(() => {
    const named = new Set(rules.map((r) => r.name));
    const out = rules.map((r) => ({ title: r.name, rule: r, players: players.filter((p) => p.position === r.name) }));
    const other = players.filter((p) => !named.has(p.position));
    if (other.length > 0) out.push({ title: "Other", rule: undefined as never, players: other });
    return out;
  }, [rules, players]);

  const required = starterCount ? parseInt(starterCount, 10) : undefined;

  const counts = rules.map((r) => {
    const count = players.filter((p) => p.position === r.name && selected.has(p.id)).length;
    return { ...r, count, ok: count >= r.min && count <= r.max };
  });

  // The first thing standing between the manager and a valid lineup, in words.
  let problem: string | null = null;
  if (required !== undefined && selected.size < required) problem = `Pick ${required - selected.size} more`;
  else if (required !== undefined && selected.size > required) problem = `Remove ${selected.size - required}`;
  else {
    const bad = counts.find((c) => !c.ok);
    if (bad) problem = bad.count < bad.min ? `Add ${bad.min - bad.count} ${bad.name}` : `Remove ${bad.count - bad.max} ${bad.name}`;
  }
  const canSave = problem === null && !saving;

  function toggle(id: string) {
    setMessage(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/lineup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week, starters: [...selected] }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ kind: "error", text: data.error ?? "Couldn't save the lineup" });
        return;
      }
      setMessage({ kind: "ok", text: `Lineup saved for week ${week}` });
    } catch {
      setMessage({ kind: "error", text: "Couldn't reach MyFantasyLeague. Try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mfl-card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-3)" }}>
          <span className="mfl-eyebrow">Starters</span>
          <span className="mfl-stat" aria-live="polite">
            {selected.size}
            {required !== undefined ? ` / ${required}` : ""}
          </span>
        </div>
        <ul className="mfl-tiles" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {counts.map((c) => (
            <li key={c.name} className="mfl-tile">
              <span className="mfl-eyebrow">
                {c.name} · {range(c.min, c.max)}
              </span>
              <span className="mfl-stat">
                {c.count}
                {!c.ok && <span className="mfl-badge mfl-badge--q" style={{ marginLeft: "var(--space-2)", verticalAlign: "middle" }}>{c.count < c.min ? "Need more" : "Too many"}</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {groups.map((g) => (
        <div key={g.title} className="mfl-card">
          <h2 className="mfl-card__head">
            {g.title}
            {g.rule ? ` · Start ${range(g.rule.min, g.rule.max)}` : ""}
          </h2>
          {g.players.length === 0 ? (
            <p className="mfl-empty">No {g.title} on your roster.</p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {g.players.map((p) => {
                const on = selected.has(p.id);
                return (
                  <li key={p.id}>
                    <button type="button" className="mfl-pick" aria-pressed={on} onClick={() => toggle(p.id)}>
                      <PositionBadge position={p.position} />
                      <span className="mfl-player__main">
                        <span className="mfl-player__name">
                          <span>{p.name}</span>
                          {p.badge && <span className={`mfl-badge mfl-badge--${p.badge.tone}`}>{p.badge.label}</span>}
                        </span>
                        <span className="mfl-player__sub" style={{ display: "block" }}>
                          {p.sub}
                          {p.proj ? ` · Proj. ${p.proj}` : ""}
                        </span>
                      </span>
                      <span className="mfl-pick__box">
                        <Icon name="check" small />
                        <span className="mfl-sr">{on ? "Starting" : "Not starting"}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}

      <div className="mfl-stack" style={{ gap: "var(--space-3)" }}>
        <button type="button" className="mfl-btn mfl-btn--accent mfl-btn--block" onClick={save} disabled={!canSave}>
          {saving ? "Saving" : `Save week ${week} lineup`}
        </button>
        <p className="mfl-note" role="status" style={{ textAlign: "center" }}>
          {problem ?? "Lineup ready"}
        </p>
        {message && (
          <p role="status" className={`mfl-note${message.kind === "error" ? " mfl-note--error" : ""}`} style={{ textAlign: "center" }}>
            {message.text}
          </p>
        )}
      </div>
    </>
  );
}
