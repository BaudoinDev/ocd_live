"use client";

import Link from "next/link";
import { registerAction } from "@/features/auth/actions";
import { ProfileForm } from "@/features/auth/profile-form";
import { useAuthTarget } from "@/features/auth/use-auth-target";
import styles from "@/features/auth/auth.module.css";

export default function RegisterPage() {
  const target = useAuthTarget();
  return <div className={styles.content}>
    <h1 className={styles.heading}>Faisons place à votre marque.</h1>
    <p className={styles.intro}>Présentez votre entreprise pour préparer vos prochains lives.</p>
    <ProfileForm registration onSave={(values) => registerAction(values, target.destination)} />
    <p className={styles.intro} style={{ marginTop: 28 }}>Déjà un compte ? <Link href={`/connexion${target.suffix}`} className={styles.textLink}>Me connecter</Link></p>
  </div>;
}
