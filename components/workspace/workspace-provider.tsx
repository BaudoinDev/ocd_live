"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { User, WorkspaceState } from "@/types/domain";

type WorkspaceValue = { user: User; state: WorkspaceState };
const WorkspaceContext = createContext<WorkspaceValue | null>(null);

/** Holds the data fetched on the server; it is refreshed by the server after every action. */
export function WorkspaceProvider({ user, state, children }: WorkspaceValue & { children: ReactNode }) {
  return <WorkspaceContext.Provider value={{ user, state }}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceValue {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace doit être utilisé dans WorkspaceProvider.");
  return context;
}
