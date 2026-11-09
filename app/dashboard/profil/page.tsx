"use client";

import { useWorkspace } from "@/components/workspace/workspace-provider";
import { updateProfileAction } from "@/features/auth/actions";
import { ProfileForm } from "@/features/auth/profile-form";
import styles from "@/features/client/client.module.css";

export default function ClientProfile() {
  const { user } = useWorkspace();
  return <>
    <div className="page-heading"><div><p className="page-kicker">VOTRE ENTREPRISE, VOTRE HISTOIRE</p><h1>Mon profil</h1><p className="page-description">Gardez vos coordonnées et les informations de votre entreprise à jour.</p></div></div>
    <section className={`panel ${styles.profilePanel}`}><div className={styles.profileIntro}><span className="avatar">{user.firstName.charAt(0)}{user.lastName.charAt(0)}</span><div><h2>{user.firstName} {user.lastName}</h2><p>{user.business.companyName} · Compte client</p></div></div><ProfileForm key={user.id} initialValues={user} onSave={updateProfileAction} /></section>
  </>;
}
