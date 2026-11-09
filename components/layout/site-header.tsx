"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, MapPin, Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { BookingLink } from "@/components/marketing/booking-link";
import styles from "./public-shell.module.css";

const navigation = [
  { label: "Accueil", href: "/" },
  { label: "Comment ça marche", href: "/#comment-ca-marche" },
  { label: "Forfaits", href: "/forfaits" },
  { label: "Contact", href: "/#contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  return (
    <>
      <div className={styles.utility}>
        <div className={`container ${styles.utilityInner}`}>
          <span>Les opportunités, c’est dehors.</span>
          <span>
            <MapPin size={12} aria-hidden="true" /> Lomé, Togo{" "}
            <span className={styles.utilityDot}>·</span> En présentiel & à
            distance
          </span>
        </div>
      </div>
      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <Logo />
          <nav className={styles.desktopNav} aria-label="Navigation principale">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={pathname === item.href ? styles.active : ""}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className={styles.headerActions}>
            <BookingLink kind="account" variant="ghost" size="sm">
              Connexion
            </BookingLink>
            <BookingLink size="sm">
              Réserver un live <ArrowUpRight size={16} aria-hidden="true" />
            </BookingLink>
          </div>
          <button
            ref={toggleRef}
            className={styles.menuToggle}
            onClick={() => setOpen(!open)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {open && (
          <nav
            id="mobile-navigation"
            className={styles.mobileNav}
            aria-label="Navigation mobile"
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            ))}
            <div className={styles.mobileActions}>
              <BookingLink kind="account" variant="secondary" onClick={() => setOpen(false)}>
                Connexion
              </BookingLink>
              <BookingLink onClick={() => setOpen(false)}>
                Réserver un live <ArrowUpRight size={16} />
              </BookingLink>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
