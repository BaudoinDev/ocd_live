import type { Metadata } from "next";
import { DemoProvider } from "@/components/demo/demo-provider";
import { WorkspaceShell } from "@/components/demo/workspace-shell";
export const metadata: Metadata = { title: "Espace client", robots: { index: false, follow: false } };
export default function DashboardLayout({ children }: { children: React.ReactNode }) { return <DemoProvider><WorkspaceShell role="client">{children}</WorkspaceShell></DemoProvider>; }
