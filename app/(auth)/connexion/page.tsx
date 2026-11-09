"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginAction } from "@/features/auth/actions";
import { loginSchema } from "@/features/auth/profile-schema";
import { useAuthTarget } from "@/features/auth/use-auth-target";
import styles from "@/features/auth/auth.module.css";

type LoginValues = { email: string; password: string };

export default function LoginPage() {
  const target = useAuthTarget();
  const [submitError, setSubmitError] = useState("");
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" }, mode: "onTouched" });
  const { errors, isSubmitting } = form.formState;
  const submit = form.handleSubmit(async (values) => {
    setSubmitError("");
    // On success the action redirects, so only a failure comes back here.
    const result = await loginAction(values, target.destination);
    if (!result.ok) setSubmitError(result.error);
  });
  return <div className={`${styles.content} ${styles.loginContent}`}>
    <h1 className={styles.heading}>Heureux de vous revoir.</h1>
    <p className={styles.intro}>Connectez-vous pour retrouver vos séances et préparer votre prochain live.</p>
    {/* POST: if submitted before hydration, the password must never end up in the URL. */}
    <form method="post" noValidate onSubmit={submit} className={styles.loginForm}>
      <div className="form-field"><label htmlFor="login-email">Adresse email</label><input className="field-input" id="login-email" type="email" autoComplete="email" placeholder="vous@entreprise.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "login-email-error" : undefined} {...form.register("email")} />{errors.email && <p id="login-email-error" role="alert" className="form-error">{errors.email.message}</p>}</div>
      <div className="form-field"><label htmlFor="login-password">Mot de passe</label><input className="field-input" id="login-password" type="password" autoComplete="current-password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "login-password-error" : undefined} {...form.register("password")} />{errors.password && <p id="login-password-error" role="alert" className="form-error">{errors.password.message}</p>}</div>
      {submitError && <p role="alert" className="notice notice-error">{submitError}</p>}
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Connexion…" : "Me connecter"}<ArrowRight size={17} aria-hidden="true" /></Button>
    </form>
    <p className={styles.intro} style={{ marginTop: 24 }}>Nouveau sur OCD Live ? <Link href={`/inscription${target.suffix}`} className={styles.textLink}>Créer un compte</Link></p>
  </div>;
}
