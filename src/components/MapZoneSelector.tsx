"use client";

import { MAP_ZONES, type MapZoneId } from "@/lib/schema";
import { useUI } from "@/store/ui";
import { clsx } from "clsx";

export function MapZoneSelector() {
  const selected = useUI((s) => s.filters.mapZone);
  const setMapZone = useUI((s) => s.setMapZone);
  return (
    <nav aria-label="Choose a Kolkata map zone" className="zone-rail relative z-40 flex h-[50px] shrink-0 items-center gap-2 overflow-x-auto border-b border-line px-3 sm:px-5 [scrollbar-width:none]">
      <span className="mr-1 flex shrink-0 items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[.16em] text-muted">
        <span className="size-1.5 rounded-full bg-accent" /> Districts
      </span>
      <button
        type="button"
        aria-pressed={selected === null}
        onClick={() => setMapZone(null)}
        className={clsx("zone-chip shrink-0", selected === null && "zone-chip-active")}
      >All Kolkata</button>
      {MAP_ZONES.map((zone, i) => (
        <button
          type="button"
          key={zone.id}
          aria-pressed={selected === zone.id}
          onClick={() => setMapZone(selected === zone.id ? null : zone.id as MapZoneId)}
          className={clsx("zone-chip shrink-0", selected === zone.id && "zone-chip-active")}
        >
          <span className="zone-chip-index">{String(i + 1).padStart(2, "0")}</span>
          {zone.label}
        </button>
      ))}
    </nav>
  );
}
