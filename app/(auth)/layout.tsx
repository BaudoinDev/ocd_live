import type { Metadata } from "next";
import { DemoProvider } from "@/components/demo/demo-provider";
import { AuthShell } from "@/features/auth/auth-shell";

export const metadata: Metadata = { title: "Votre espace | OCD Live", description: "Accédez à votre espace de démonstration OCD Live et préparez vos prochaines séances." };

export default function AuthLayout({ children }: { children: React.ReactNode }) { return <DemoProvider><AuthShell>{children}</AuthShell></DemoProvider>; }
