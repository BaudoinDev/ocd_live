"use client";

import { useSyncExternalStore } from "react";

const subscribe = (callback: () => void) => {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
};
const searchSnapshot = () => window.location.search;
const emptySearch = () => "";

export function useAuthTarget() {
  const search = useSyncExternalStore(subscribe, searchSnapshot, emptySearch);
  const query = new URLSearchParams(search);
  const next = query.get("next");
  const forfait = query.get("forfait");
  const safeNext = next && /^\/dashboard(?:\/|\?|$)/.test(next) && !next.includes("\\") ? next : null;
  const suffix = safeNext ? `?next=${encodeURIComponent(safeNext)}` : forfait ? `?forfait=${encodeURIComponent(forfait)}` : "";
  return { destination: safeNext ?? (forfait ? `/dashboard/reserver?forfait=${encodeURIComponent(forfait)}` : "/dashboard"), suffix };
}
