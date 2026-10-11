"use client";

import dynamic from "next/dynamic";

/** The map engines are large. Load them after the panel is interactive, behind a placeholder of the same size. */
const placeholder = () => <div aria-hidden className="size-full bg-surface2" />;
const FreeMapCanvas = dynamic(() => import("./FreeMapCanvas").then((m) => m.FreeMapCanvas), { ssr: false, loading: placeholder });

/**
 * OpenFreeMap is the map provider; directions can open in the user's navigation app.
 */
export function MapCanvas() {
  return <FreeMapCanvas />;
}
