"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Bell, CalendarDays, ChevronRight, LayoutDashboard, LogOut, Menu, PackageOpen, Plus, Radio, ShieldCheck, UserRound, Users, X } from "lucide-react";
import { logoutAction } from "@/features/auth/actions";
import type { UserRole } from "@/types/domain";
import { useWorkspace } from "./workspace-provider";

const clientNav = [{ href: "/dashboard", label: "Vue d’ensemble", icon: LayoutDashboard }, { href: "/dashboard/reservations", label: "Mes réservations", icon: CalendarDays }, { href: "/dashboard/reserver", label: "Réserver un live", icon: Plus }, { href: "/dashboard/forfaits", label: "Les forfaits", icon: PackageOpen }, { href: "/dashboard/profil", label: "Mon profil", icon: UserRound }];
const adminNav = [{ href: "/admin", label: "Vue d’ensemble", icon: LayoutDashboard }, { href: "/admin/reservations", label: "Réservations", icon: CalendarDays }, { href: "/admin/calendrier", label: "Calendrier", icon: Radio }, { href: "/admin/clients", label: "Clients", icon: Users }, { href: "/admin/forfaits", label: "Forfaits", icon: PackageOpen }, { href: "/admin/notifications", label: "Notifications", icon: Bell }];

const ADMIN_REFRESH_MS = 15_000;

/** Brings new bookings to the manager's screen without a page reload, only while the tab is visible. */
function useLiveRefresh(enabled: boolean) {
  const router = useRouter();
  useEffect(() => {
    if (!enabled) return;
    const refresh = () => { if (document.visibilityState === "visible") router.refresh(); };
    const timer = window.setInterval(refresh, ADMIN_REFRESH_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", refresh); };
  }, [enabled, router]);
}

export function WorkspaceShell({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const { user, state } = useWorkspace();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const toggle = useRef<HTMLButtonElement>(null);
  const admin = role === "admin";
  const nav = admin ? adminNav : clientNav;
  const current = nav.find((item) => item.href === pathname)?.label ?? "Mon espace";
  const unread = state.notifications.filter((item) => !item.read).length;
  useLiveRefresh(admin);
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); } };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [open]);
  return <div className={`workspace ${admin ? "workspace-admin" : "workspace-client"}`}>
    <a className="skip-link" href="#app-content">Aller au contenu</a>
    {open && <button className="sidebar-scrim" aria-label="Fermer la navigation" onClick={() => setOpen(false)} />}
    <aside className={`workspace-sidebar ${open ? "sidebar-open" : ""}`}>
      <Link className="workspace-logo" href="/" aria-label="OCD Live, accueil"><Image src="/images/ocd-logo.png" alt="OCD Live" width={990} height={381} sizes="110px" loading="eager" /></Link>
      <div className="sidebar-space"><span className="sidebar-space-icon">{admin ? <ShieldCheck size={17} /> : <UserRound size={17} />}</span><div><strong>{admin ? "Administration" : "Espace client"}</strong><span>{admin ? "Le studio de vos opportunités" : user.business.companyName}</span></div></div>
      <span className="sidebar-section-label">VOTRE ESPACE</span>
      <nav aria-label={admin ? "Navigation administrateur" : "Navigation client"}>{nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={pathname === href ? "page" : undefined}><Icon size={18} strokeWidth={1.7} /><span>{label}</span>{href === "/admin/notifications" && unread > 0 && <span className="sidebar-count">{unread}</span>}</Link>)}</nav>
      <div className="sidebar-help"><span><Radio size={17} /> Votre activité, en direct.</span><p>Des produits à montrer.<br />Une histoire à partager.</p><Link href={admin ? "/admin/calendrier" : "/dashboard/reserver"}>{admin ? "Voir le calendrier" : "Préparer un live"} <ArrowUpRight size={16} /></Link></div>
      <div className="sidebar-bottom"><Link href="/"><ArrowLeft size={16} /> Retour au site</Link><form action={logoutAction}><button type="submit"><LogOut size={16} /> Déconnexion</button></form></div>
    </aside>
    <div className="workspace-body">
      <header className="workspace-header">
        <div className="workspace-breadcrumb"><button ref={toggle} className="workspace-menu" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Fermer la navigation" : "Ouvrir la navigation"}>{open ? <X size={21} /> : <Menu size={21} />}</button><span>{admin ? "Administration" : "Espace client"}</span><ChevronRight size={13} /><strong>{current}</strong></div>
        <div className="workspace-header-actions">{admin && <Link className="notification-link" href="/admin/notifications" aria-label={`Notifications, ${unread} non lues`}><Bell size={19} />{unread > 0 && <span />}</Link>}<span className="workspace-avatar" role="img" aria-label={`${user.firstName} ${user.lastName}`}>{user.firstName[0]}{user.lastName[0]}</span></div>
      </header>
      <main id="app-content" className="workspace-content">{children}</main>
      <footer className="workspace-footer"><span>OCD Live · Les opportunités, c’est dehors.</span><span>Heures affichées : Lomé (UTC+0)</span></footer>
    </div>
  </div>;
}
