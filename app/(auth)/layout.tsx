import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/auth-shell";

export const metadata: Metadata = { title: "Votre espace | OCD Live", description: "Accédez à votre espace OCD Live et préparez vos prochaines séances." };

export default function AuthLayout({ children }: { children: React.ReactNode }) { return <AuthShell>{children}</AuthShell>; }
