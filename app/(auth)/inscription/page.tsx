"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FlaskConical } from "lucide-react";
import { useDemo } from "@/components/demo/demo-provider";
import { ProfileForm } from "@/features/auth/profile-form";
import styles from "@/features/auth/auth.module.css";
import { useAuthTarget } from "@/features/auth/use-auth-target";

export default function RegisterPage() {
  const { actions, ready } = useDemo();
  const router = useRouter();
  const target = useAuthTarget();
  return <div className={styles.content}>
    <span className={styles.badge}><FlaskConical size={13} aria-hidden="true" /> Compte de démonstration</span>
    <h1 className={styles.heading}>Faisons place à votre marque.</h1>
    <p className={styles.intro}>Présentez votre entreprise pour préparer vos prochains lives. Ce prototype fonctionne sans mot de passe ; utilisez des informations fictives.</p>
    {ready ? <ProfileForm registration onSave={(values) => {
      actions.register(values);
      router.push(target.destination);
    }} /> : <p role="status" className="notice">Préparation de votre espace…</p>}
    <p className={styles.intro} style={{ marginTop: 28 }}>Déjà un profil ? <Link href={`/connexion${target.suffix}`} className={styles.textLink}>Accéder à mon espace</Link></p>
  </div>;
}
