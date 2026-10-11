"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Drawer } from "vaul";
import { MapCanvas } from "@/components/map/MapCanvas";
import { EssentialsSheet } from "@/components/EssentialsSheet";
import { Panel } from "@/components/Panel";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LogoMark } from "@/components/ui/Logo";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { useFiltered } from "@/lib/useFiltered";
import { placeBySlug } from "@/lib/data";
import { useLegLoader } from "@/lib/route/useLegs";
import { useUI } from "@/store/ui";
import { MapZoneSelector } from "@/components/MapZoneSelector";

const DESKTOP = "(min-width: 640px)";
const PANEL_W = 320;
// Fractions of the viewport height visible: peek (search + chips), half, full.
const SNAPS = [0.27, 0.55, 0.92];

/** null until hydrated, so the server and first client render agree. */
function useIsDesktop() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(DESKTOP);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(DESKTOP).matches,
    () => null,
  );
}

import { OfflineBanner } from "@/components/OfflineBanner";

export function AppShell() {
  const isDesktop = useIsDesktop();
  const selected = useUI((s) => s.selected);
  const query = useUI((s) => s.query);
  const { matched, visibleCount } = useFiltered();
  const [snap, setSnap] = useState<number | string | null>(SNAPS[0]);

  useLegLoader();

  // The bottom sheet's library marks the whole app <main> aria-hidden, which hides the map controls and theme
  // toggle from screen readers. The sheet is non-modal, so keep everything reachable.
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    const reveal = () => {
      main.removeAttribute("aria-hidden");
      main.removeAttribute("data-aria-hidden");
    };
    reveal();
    const observer = new MutationObserver(reveal);
    observer.observe(main, { attributes: true, attributeFilter: ["aria-hidden", "data-aria-hidden"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Read the URL *now*: the URL-sync effect below clears ?place= as soon as the selection is empty.
    const params = new URLSearchParams(location.search);
    Promise.resolve(useUI.persist.rehydrate()).then(() => {
      const route = params.get("route")?.split(",").filter((s) => placeBySlug.has(s));
      if (route?.length) {
        useUI.getState().setStops(route);
        useUI.getState().setTab("plan");
      }

      if (location.pathname.startsWith("/area/")) {
        const zoneId = location.pathname.slice(6);
        useUI.getState().toggle("zones", zoneId as never);
      } else if (location.pathname.startsWith("/metro/")) {
        const metroId = decodeURIComponent(location.pathname.slice(7));
        useUI.getState().toggle("metro", metroId as never);
      }

      const slug = location.pathname.startsWith("/p/") ? location.pathname.slice(3) : params.get("place");
      if (slug && placeBySlug.has(slug)) useUI.getState().select(slug);
    });
  }, []);

  // Keep the URL shareable as the selection changes.
  useEffect(() => {
    const url = new URL(location.href);
    if (selected) {
      url.searchParams.set("place", selected);
    } else {
      url.searchParams.delete("place");
    }
    // Only rewrite the pathname back to root if we are navigating away from an SEO route inside the SPA
    if (url.pathname.startsWith("/p/") || url.pathname.startsWith("/area/") || url.pathname.startsWith("/metro/")) {
      url.pathname = "/";
    }
    history.replaceState(null, "", url);
  }, [selected]);

  // Tell the map how much of it is covered, so selected pins land in the visible part.
  useEffect(() => {
    if (isDesktop === null) return;
    const bottom = isDesktop ? 0 : typeof snap === "number" ? innerHeight * snap : innerHeight * SNAPS[0];
    // Desktop: the map sits beside the panel, so nothing covers it. Mobile: the sheet overlays the bottom.
    useUI.getState().setInset({ left: 0, bottom });
  }, [isDesktop, snap]);

  // Selecting on mobile lifts the sheet to show details (adjusting state during render, per React docs).
  const [prevSelected, setPrevSelected] = useState(selected);
  if (selected !== prevSelected) {
    setPrevSelected(selected);
    if (!isDesktop && selected) setSnap(SNAPS[1]);
  }

  return (
    <main ref={mainRef} className="relative flex h-dvh w-full flex-col overflow-hidden bg-bg">
      <OfflineBanner />
      <EssentialsSheet />
      <header className="festival-header relative z-50 flex h-14 shrink-0 items-center gap-3 border-b border-line px-3 shadow-xs backdrop-blur-md sm:px-5">
        <a href="/" aria-label="PujoMap home" className="flex shrink-0 items-center gap-2.5">
          <LogoMark />
          <span className="leading-none"><span className="block font-display text-lg font-bold tracking-tight text-fg">Pujo<span className="text-primary">Map</span></span><span className="mt-1 block text-[8px] font-extrabold uppercase tracking-[.2em] text-muted">Kolkata · Puja Atlas</span></span>
        </a>
        <div className="mx-1 hidden h-7 w-px bg-line sm:block" />
        <label className="relative min-w-0 max-w-2xl flex-1">
          <MagnifyingGlass size={17} weight="bold" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onFocus={() => !isDesktop && setSnap(0.92)}
            onChange={(e) => useUI.getState().setQuery(e.target.value)}
            placeholder="Search pandals, baris, areas, food…"
            enterKeyHint="search"
            aria-label="Search pandals, baris, areas, and food"
            className="h-10 w-full rounded-2xl border border-line bg-surface/90 pl-9 pr-10 text-sm outline-none transition-shadow placeholder:text-muted/80 focus:ring-2 focus:ring-primary/35"
          />
          {query ? (
            <button type="button" aria-label="Clear search" onClick={() => useUI.getState().setQuery("")} className="absolute right-1 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-surface2"><X size={15} weight="bold" /></button>
          ) : (
            <span className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-line bg-bg px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted shadow-2xs sm:block">/</span>
          )}
        </label>
        <span className="hidden whitespace-nowrap text-xs font-medium text-muted md:block" aria-live="polite">{matched.size} of {visibleCount} shown</span>
        <ThemeToggle className="shrink-0" />
      </header>

      <MapZoneSelector />

      <div className="relative flex min-h-0 flex-1">
        {/* Sidebar and map share the available area below the toolbar. */}
        <aside
          style={{ width: PANEL_W }}
          className="relative z-30 hidden shrink-0 flex-col border-r border-line bg-bg shadow-float min-[640px]:flex"
        >
          {isDesktop && <Panel onSearchFocus={() => document.querySelector<HTMLInputElement>('header input')?.focus()} />}
        </aside>

        <div className="relative z-0 min-w-0 flex-1 isolate">
          <MapCanvas />
        </div>
      </div>

      {isDesktop === false && (
        <Drawer.Root
          open
          modal={false}
          dismissible={false}
          handleOnly
          snapPoints={SNAPS}
          activeSnapPoint={snap}
          setActiveSnapPoint={setSnap}
        >
          <Drawer.Portal>
            <Drawer.Content
              aria-describedby={undefined}
              className="fixed inset-x-0 bottom-0 z-40 flex h-dvh flex-col rounded-t-3xl border border-b-0 border-line bg-bg shadow-float outline-none isolate"
            >
              <Drawer.Title className="sr-only">Places</Drawer.Title>
              <Drawer.Handle className="!my-2.5 !h-1.5 !w-12 !bg-line cursor-grab active:cursor-grabbing" />
              {/* Content is viewport-tall (vaul's offset maths needs that), so size the scroll area to what's visible. */}
              <div
                style={{ height: `calc(${(typeof snap === "number" ? snap : SNAPS[0]) * 100}dvh - 1.75rem)` }}
                className="pb-[env(safe-area-inset-bottom)]"
              >
                <Panel onSearchFocus={() => document.querySelector<HTMLInputElement>('header input')?.focus()} />
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      )}
    </main>
  );
}
