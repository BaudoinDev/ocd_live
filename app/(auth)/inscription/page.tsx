"use client";

import Link from "next/link";
import { registerAction } from "@/features/auth/actions";
import { RegistrationWizard } from "@/features/auth/registration-wizard";
import { useAuthTarget } from "@/features/auth/use-auth-target";
import styles from "@/features/auth/auth.module.css";

export default function RegisterPage() {
  const target = useAuthTarget();
  return <div className={styles.content}>
    <h1 className={styles.heading}>Faisons place à votre marque.</h1>
    <p className={styles.intro}>Quatre étapes, et votre premier live est à portée de main.</p>
    <RegistrationWizard onSubmit={(values) => registerAction(values, target.destination)} />
    <p className={styles.intro} style={{ marginTop: 28 }}>Déjà un compte ? <Link href={`/connexion${target.suffix}`} className={styles.textLink}>Me connecter</Link></p>
  </div>;
}
