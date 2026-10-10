"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Horizontal scrolling row of pills (weeks, teams) that opens centred on the selected one. */
export default function ChipRow({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = ref.current;
    const selected = row?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!row || !selected) return;
    row.scrollLeft = selected.offsetLeft - (row.clientWidth - selected.offsetWidth) / 2;
  }, []);

  return (
    <nav ref={ref} className="mfl-chips" aria-label={label} style={{ position: "relative" }}>
      {children}
    </nav>
  );
}
