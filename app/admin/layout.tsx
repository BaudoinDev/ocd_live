import type { Metadata } from "next";
import { DemoProvider } from "@/components/demo/demo-provider";
import { WorkspaceShell } from "@/components/demo/workspace-shell";
export const metadata: Metadata = { title: "Administration", robots: { index: false, follow: false } };
export default function AdminLayout({ children }: { children: React.ReactNode }) { return <DemoProvider><WorkspaceShell role="admin">{children}</WorkspaceShell></DemoProvider>; }
