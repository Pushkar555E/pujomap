"use client";

import { useMemo } from "react";
import { places, zones } from "./data";
import { isFood, mapZoneFor } from "./schema";
import { applyFilters } from "./filter";
import { buildSearch } from "./search";
import { useNow } from "./useNow";
import { useUI } from "@/store/ui";

const search = buildSearch(places, zones);

/** Single source of truth for what is on the map / in the list, shared by both. */
export function useFiltered() {
  const filters = useUI((s) => s.filters);
  const query = useUI((s) => s.query);
  const mode = useUI((s) => s.mode);
  const saved = useUI((s) => s.saved);
  const visited = useUI((s) => s.visited);
  const clock = useNow();
  const weekday = clock?.weekday;
  const minute = clock?.minute;

  return useMemo(() => {
    const mine = { saved: new Set(saved), visited: new Set(visited) };
    const { visible, matched } = applyFilters(places, filters, search(query), mine, weekday === undefined || minute === undefined ? undefined : { weekday, minute });
    const hasSearchQuery = query.trim().length > 0;
    // A map district is a geographic scope, so it always removes out-of-zone pins (even in Highlight mode).
    const inZone = filters.mapZone ? visible.filter((p) => mapZoneFor(p) === filters.mapZone) : visible;
    const rendered = hasSearchQuery || mode === "filter" ? inZone.filter((p) => matched.has(p.id)) : inZone;
    const list = visible
      .filter((p) => matched.has(p.id))
      .sort((a, b) => a.name.en.localeCompare(b.name.en));
    return { rendered, matched, list, visibleCount: visible.length };
  }, [filters, query, mode, saved, visited, weekday, minute]);
}
