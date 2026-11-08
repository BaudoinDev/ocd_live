import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/demo/workspace-shell";
export const metadata: Metadata = { title: "Administration", robots: { index: false, follow: false } };
export default function AdminLayout({ children }: { children: React.ReactNode }) { return <WorkspaceShell role="admin">{children}</WorkspaceShell>; }
