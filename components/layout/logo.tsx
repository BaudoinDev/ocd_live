import Image from "next/image";
import Link from "next/link";
import styles from "./public-shell.module.css";

export function Logo({ footer = false }: { footer?: boolean }) {
  return (
    <Link
      className={`${styles.logo} ${footer ? styles.footerLogo : ""}`}
      href="/"
      aria-label="OCD Live, accueil"
    >
      <Image
        src="/images/Orange%20OCD%20Live%20Logo.png"
        alt="OCD Live"
        width={1672}
        height={941}
        sizes="148px"
        preload={!footer}
      />
    </Link>
  );
}
