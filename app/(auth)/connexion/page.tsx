"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, FlaskConical, Info, ShieldCheck, UserRound } from "lucide-react";
import { useDemo } from "@/components/demo/demo-provider";
import { Button } from "@/components/ui/button";
import styles from "@/features/auth/auth.module.css";
import type { UserRole } from "@/types/demo";
import { useAuthTarget } from "@/features/auth/use-auth-target";

const loginSchema = z.object({ email: z.string().trim().email("Indiquez une adresse email valide.") });

export default function LoginPage() {
  const { actions, ready } = useDemo();
  const router = useRouter();
  const target = useAuthTarget();
  const [submitError, setSubmitError] = useState("");
  const form = useForm<{ email: string }>({ resolver: zodResolver(loginSchema), defaultValues: { email: "" }, mode: "onTouched" });
  const destination = (role: UserRole) => role === "admin" ? "/admin" : target.destination;
  const demoLogin = (role: UserRole) => {
    setSubmitError("");
    try { actions.login(role); router.push(destination(role)); }
    catch (error) { setSubmitError(error instanceof Error ? error.message : "Connexion impossible. Réessayez."); }
  };
  return <div className={`${styles.content} ${styles.loginContent}`}>
    <span className={styles.badge}><FlaskConical size={13} aria-hidden="true" /> Démonstration interactive</span>
    <h1 className={styles.heading}>Heureux de vous revoir.</h1>
    <p className={styles.intro}>Choisissez un espace pour explorer OCD Live, ou retrouvez votre profil créé dans ce navigateur.</p>
    <div className={styles.demoOptions}>
      <button className={styles.demoButton} onClick={() => demoLogin("client")} disabled={!ready}><UserRound size={22} aria-hidden="true" /><span><strong>Explorer l’espace client</strong><span>Un compte démo avec des réservations exemples</span></span><ArrowRight size={18} aria-hidden="true" /></button>
      <button className={styles.demoButton} onClick={() => demoLogin("admin")} disabled={!ready}><ShieldCheck size={22} aria-hidden="true" /><span><strong>Explorer l’espace administrateur</strong><span>Réservations, planning et gestion des clients</span></span><ArrowRight size={18} aria-hidden="true" /></button>
    </div>
    <div className={styles.divider}>Vous avez déjà créé un profil ?</div>
    <form noValidate onSubmit={form.handleSubmit(({ email }) => {
      setSubmitError("");
      try { const account = actions.loginByEmail(email); router.push(destination(account.role)); }
      catch (error) { setSubmitError(error instanceof Error ? error.message : "Aucun profil ne correspond à cette adresse dans ce navigateur."); }
    })} className={styles.loginForm}>
      <div className="form-field"><label htmlFor="login-email">Adresse email</label><input className="field-input" id="login-email" type="email" autoComplete="email" placeholder="vous@entreprise.com" aria-invalid={Boolean(form.formState.errors.email)} aria-describedby={form.formState.errors.email ? "login-email-error" : undefined} {...form.register("email")} />{form.formState.errors.email && <p id="login-email-error" role="alert" className="form-error">{form.formState.errors.email.message}</p>}</div>
      {submitError && <p role="alert" className="notice notice-error">{submitError}</p>}
      <Button type="submit" disabled={!ready || form.formState.isSubmitting}>Retrouver mon espace<ArrowRight size={17} aria-hidden="true" /></Button>
    </form>
    <p className={styles.demoNote}><Info size={17} aria-hidden="true" /><span>Accès simulé, sans mot de passe. Les profils et réservations restent dans ce navigateur. Utilisez des informations fictives.</span></p>
    <p className={styles.intro} style={{ marginTop: 24 }}>Nouveau sur OCD Live ? <Link href={`/inscription${target.suffix}`} className={styles.textLink}>Créer un compte démo</Link></p>
  </div>;
}
