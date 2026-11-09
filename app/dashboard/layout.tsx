import type { Metadata } from "next";
import { WorkspaceGate } from "@/components/workspace/workspace-gate";

export const metadata: Metadata = { title: "Espace client", robots: { index: false, follow: false } };
// Per-user data: navigating here always waits for the session check on the server.
export const instant = false;

export default function DashboardLayout({ children }: { children: React.ReactNode }) { return <WorkspaceGate role="client">{children}</WorkspaceGate>; }
