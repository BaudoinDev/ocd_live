"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { createDemoStore, type DemoActions, type DemoSnapshot } from "@/lib/demo/store";
import type { User } from "@/types/demo";

type DemoContextValue = DemoSnapshot & { user: User | null; actions: DemoActions };
const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createDemoStore);
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  useEffect(() => store.initialize(), [store]);
  const user = snapshot.state.users.find((item) => item.id === snapshot.state.sessionUserId) ?? null;
  return <DemoContext.Provider value={{ ...snapshot, user, actions: store.actions }}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoContextValue {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo doit être utilisé dans DemoProvider.");
  return context;
}
