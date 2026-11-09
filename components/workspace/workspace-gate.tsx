import { Suspense } from "react";
import { Radio } from "lucide-react";
import { requireRole } from "@/lib/auth/dal";
import { loadWorkspaceState } from "@/lib/data/workspace";
import type { UserRole } from "@/types/domain";
import { WorkspaceProvider } from "./workspace-provider";
import { WorkspaceShell } from "./workspace-shell";

async function AuthorizedWorkspace({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const user = await requireRole(role);
  const state = await loadWorkspaceState(user);
  return <WorkspaceProvider user={user} state={state}><WorkspaceShell role={role}>{children}</WorkspaceShell></WorkspaceProvider>;
}

/** Nothing inside a workspace renders until the session and its role are verified against the database. */
export function WorkspaceGate({ role, children }: { role: UserRole; children: React.ReactNode }) {
  return <Suspense fallback={<div className="workspace-loading" role="status"><Radio size={29} aria-hidden="true" /><p>Préparation de votre espace…</p></div>}>
    <AuthorizedWorkspace role={role}>{children}</AuthorizedWorkspace>
  </Suspense>;
}
