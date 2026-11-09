"use client";

import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/action-result";
import { ProfileField, type FieldProps } from "./profile-form";
import { emptyProfile, registrationSchema, type RegistrationInput } from "./profile-schema";
import styles from "./registration-wizard.module.css";

const steps: { label: string; title: string; hint: string; fields: FieldProps[] }[] = [
  {
    label: "Vous", title: "Commençons par vous.", hint: "Pour que l’équipe OCD puisse vous recontacter.",
    fields: [
      { name: "firstName", label: "Prénom", autoComplete: "given-name", placeholder: "Votre prénom" },
      { name: "lastName", label: "Nom", autoComplete: "family-name", placeholder: "Votre nom" },
      { name: "phone", label: "Téléphone", type: "tel", autoComplete: "tel", placeholder: "+228 90 00 00 00", full: true },
    ],
  },
  {
    label: "Entreprise", title: "Où trouver votre entreprise ?", hint: "Le nom de votre marque et l’endroit où elle vit.",
    fields: [
      { name: "business.companyName", label: "Nom de l’entreprise", autoComplete: "organization", placeholder: "Le nom de votre marque", full: true },
      { name: "business.country", label: "Pays", autoComplete: "country-name", placeholder: "Ex. Togo" },
      { name: "business.city", label: "Ville", autoComplete: "address-level2", placeholder: "Ex. Lomé" },
    ],
  },
  {
    label: "Activité", title: "Que proposez-vous ?", hint: "Ces détails nous aident à préparer votre live.",
    fields: [
      { name: "business.sector", label: "Secteur d’activité", placeholder: "Ex. mode, restauration, services…", full: true },
      { name: "business.description", label: "Description de l’activité", multiline: true, placeholder: "Présentez votre entreprise en quelques mots." },
      { name: "business.products", label: "Produits ou services commercialisés", multiline: true, placeholder: "Que souhaitez-vous présenter pendant vos lives ?" },
      { name: "business.tiktok", label: "Nom d’utilisateur TikTok", optional: true, placeholder: "@monentreprise", hint: "Utile pour préparer une participation à distance.", full: true },
    ],
  },
  {
    label: "Accès", title: "Dernière étape.", hint: "L’adresse et le mot de passe qui vous ouvriront votre espace.",
    fields: [
      { name: "email", label: "Adresse email", type: "email", autoComplete: "email", placeholder: "vous@entreprise.com", full: true },
      { name: "password", label: "Mot de passe", type: "password", autoComplete: "new-password", hint: "10 caractères minimum." },
      { name: "passwordConfirm", label: "Confirmez le mot de passe", type: "password", autoComplete: "new-password" },
    ],
  },
];

/** On success the server redirects, so `onSubmit` only ever resolves with a failure to display. */
export function RegistrationWizard({ onSubmit }: { onSubmit: (values: RegistrationInput) => Promise<ActionResult> }) {
  const form = useForm<RegistrationInput>({ resolver: zodResolver(registrationSchema), defaultValues: { ...emptyProfile, password: "", passwordConfirm: "" }, mode: "onTouched" });
  const [step, setStep] = useState(0);
  const [goingBack, setGoingBack] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const stepperRef = useRef<HTMLOListElement>(null);
  const mounted = useRef(false);
  const current = steps[step];
  const last = step === steps.length - 1;
  const { isSubmitting } = form.formState;

  // Screen readers and keyboards follow the new step; on small screens it also comes back into view.
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    headingRef.current?.focus({ preventScroll: true });
    const top = stepperRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) stepperRef.current?.scrollIntoView({ block: "start" });
  }, [step]);

  function goTo(target: number) {
    setSubmitError("");
    setGoingBack(target < step);
    setStep(target);
  }
  const create = form.handleSubmit(async (values) => {
    setSubmitError("");
    const result = await onSubmit(values);
    if (!result.ok) setSubmitError(result.error);
  });
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (last) return create(event);
    if (await form.trigger(current.fields.map((field) => field.name), { shouldFocus: true })) goTo(step + 1);
  }

  return <FormProvider {...form}>
    {/* POST: if submitted before hydration, the password must never end up in the URL. */}
    <form method="post" noValidate onSubmit={handleSubmit}>
      <div className={styles.stepperWrap}>
      <span className={styles.track} aria-hidden="true"><span className={styles.fill} style={{ transform: `scaleX(${step / (steps.length - 1)})` }} /></span>
      <ol ref={stepperRef} className={styles.stepper} aria-label="Étapes de l’inscription">
        {steps.map(({ label }, index) => <li key={label} className={`${styles.item} ${index === step ? styles.current : ""} ${index < step ? styles.complete : ""}`} aria-current={index === step ? "step" : undefined}>
          <button type="button" className={styles.stepButton} disabled={index >= step} onClick={() => goTo(index)} aria-label={index < step ? `Revenir à l’étape ${index + 1} : ${label}` : `Étape ${index + 1} : ${label}`}>
            <span className={styles.marker}>{index < step ? <svg className={styles.check} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7" /></svg> : index + 1}</span>
            <span>{label}</span>
          </button>
        </li>)}
      </ol>
      </div>

      <div key={step} className={`${styles.step} ${goingBack ? styles.back : ""}`}>
        <div>
          <p className={styles.count} role="status">Étape {step + 1} sur {steps.length}</p>
          <h2 ref={headingRef} tabIndex={-1} className={styles.title}>{current.title}</h2>
          <p className={styles.hint}>{current.hint}</p>
        </div>
        <div className={`form-grid ${styles.fields}`}>{current.fields.map((field) => <ProfileField key={field.name} {...field} />)}</div>
      </div>

      {submitError && <p role="alert" className={`notice notice-error ${styles.error}`}>{submitError}</p>}
      <div className={styles.actions}>
        {step > 0 && <Button type="button" variant="ghost" disabled={isSubmitting} onClick={() => goTo(step - 1)}><ArrowLeft size={17} aria-hidden="true" />Retour</Button>}
        <Button type="submit" className={styles.next} disabled={isSubmitting}>
          {isSubmitting ? <><span className={styles.spinner} aria-hidden="true" />Création…</> : last ? <><Check size={17} aria-hidden="true" />Créer mon compte</> : <>Continuer<ArrowRight size={17} aria-hidden="true" /></>}
        </Button>
      </div>
    </form>
  </FormProvider>;
}
