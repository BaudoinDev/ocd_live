"use client";

import { useSyncExternalStore } from "react";
import { safeNextPath } from "@/lib/auth/constants";

const subscribe = (callback: () => void) => {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
};
const searchSnapshot = () => window.location.search;
const emptySearch = () => "";

export const useSearch = () => new URLSearchParams(useSyncExternalStore(subscribe, searchSnapshot, emptySearch));

export function useAuthTarget() {
  const query = useSearch();
  const safeNext = safeNextPath(query.get("next"));
  const forfait = query.get("forfait");
  const suffix = safeNext ? `?next=${encodeURIComponent(safeNext)}` : forfait ? `?forfait=${encodeURIComponent(forfait)}` : "";
  return { destination: safeNext ?? (forfait ? `/dashboard/reserver?forfait=${encodeURIComponent(forfait)}` : "/dashboard"), suffix };
}
