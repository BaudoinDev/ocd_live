import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/demo/workspace-shell";
export const metadata: Metadata = { title: "Espace client", robots: { index: false, follow: false } };
export default function DashboardLayout({ children }: { children: React.ReactNode }) { return <WorkspaceShell role="client">{children}</WorkspaceShell>; }
