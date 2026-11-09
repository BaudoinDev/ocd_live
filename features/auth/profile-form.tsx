"use client";

import { useState } from "react";
import { FormProvider, useForm, useFormContext, type Path, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/action-result";
import type { ProfileInput } from "@/types/domain";
import { emptyProfile, profileSchema, registrationSchema, type RegistrationInput } from "./profile-schema";
import styles from "./auth.module.css";

type FieldProps = { name: Path<RegistrationInput>; label: string; type?: string; autoComplete?: string; placeholder?: string; multiline?: boolean; optional?: boolean; hint?: string };

function ProfileField({ name, label, type = "text", autoComplete, placeholder, multiline, optional, hint }: FieldProps) {
  const { register, getFieldState, formState } = useFormContext<RegistrationInput>();
  const { error } = getFieldState(name, formState);
  const id = `profile-${name.replaceAll(".", "-")}`;
  const describedBy = [error ? `${id}-error` : "", hint ? `${id}-hint` : ""].filter(Boolean).join(" ") || undefined;
  const props = { id, className: "field-input", "aria-invalid": Boolean(error), "aria-describedby": describedBy, placeholder, ...register(name) };
  return <div className={`form-field ${multiline ? styles.fullWidth : ""}`}>
    <label htmlFor={id}>{label}{optional && <span className={styles.optional}> · facultatif</span>}</label>
    {multiline ? <textarea {...props} rows={3} /> : <input {...props} type={type} autoComplete={autoComplete} />}
    {hint && <p id={`${id}-hint`} className="form-hint">{hint}</p>}
    {error && <p id={`${id}-error`} className="form-error" role="alert">{error.message}</p>}
  </div>;
}

/** On success, registration redirects from the server, so `onSave` only returns for failures or profile edits. */
export function ProfileForm({ initialValues = emptyProfile, onSave, registration = false }: { initialValues?: ProfileInput; onSave: (values: RegistrationInput) => Promise<ActionResult>; registration?: boolean }) {
  const schema = registration ? registrationSchema : profileSchema;
  const form = useForm<RegistrationInput>({ resolver: zodResolver(schema) as unknown as Resolver<RegistrationInput>, defaultValues: { ...initialValues, password: "", passwordConfirm: "" }, mode: "onTouched" });
  const [message, setMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const submit = form.handleSubmit(async (values) => {
    setSubmitError("");
    setMessage("");
    const result = await onSave(values);
    if (!result.ok) setSubmitError(result.error);
    else if (!registration) setMessage("Votre profil a bien été enregistré.");
  });
  return <FormProvider {...form}>
    <form method="post" onSubmit={submit} noValidate className={styles.profileForm}>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}><span>01</span> Vos coordonnées</legend>
        <div className="form-grid">
          <ProfileField name="firstName" label="Prénom" autoComplete="given-name" placeholder="Votre prénom" />
          <ProfileField name="lastName" label="Nom" autoComplete="family-name" placeholder="Votre nom" />
          <ProfileField name="email" label="Adresse email" type="email" autoComplete="email" placeholder="vous@entreprise.com" />
          <ProfileField name="phone" label="Téléphone" type="tel" autoComplete="tel" placeholder="+228 90 00 00 00" />
        </div>
      </fieldset>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}><span>02</span> Votre entreprise</legend>
        <div className="form-grid">
          <ProfileField name="business.companyName" label="Nom de l’entreprise" autoComplete="organization" placeholder="Le nom de votre marque" />
          <ProfileField name="business.sector" label="Secteur d’activité" placeholder="Ex. mode, restauration, services…" />
          <ProfileField name="business.country" label="Pays" autoComplete="country-name" placeholder="Ex. Togo" />
          <ProfileField name="business.city" label="Ville" autoComplete="address-level2" placeholder="Ex. Lomé" />
          <ProfileField name="business.description" label="Description de l’activité" multiline placeholder="Présentez votre entreprise en quelques mots." />
          <ProfileField name="business.products" label="Produits ou services commercialisés" multiline placeholder="Que souhaitez-vous présenter pendant vos lives ?" />
          <ProfileField name="business.tiktok" label="Nom d’utilisateur TikTok" optional placeholder="@monentreprise" hint="Utile pour préparer une participation à distance." />
        </div>
      </fieldset>
      {registration && <fieldset className={styles.fieldset}>
        <legend className={styles.legend}><span>03</span> Votre mot de passe</legend>
        <div className="form-grid">
          <ProfileField name="password" label="Mot de passe" type="password" autoComplete="new-password" hint="10 caractères minimum." />
          <ProfileField name="passwordConfirm" label="Confirmez le mot de passe" type="password" autoComplete="new-password" />
        </div>
      </fieldset>}
      {submitError && <div role="alert" className="notice notice-error">{submitError}</div>}
      {message && <div role="status" className="notice notice-success"><Check size={18} aria-hidden="true" /> {message}</div>}
      <div className={`form-actions ${styles.formActions}`}>
        {registration && <p className="form-hint">Tous les champs sont requis, sauf le nom TikTok.</p>}
        <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Enregistrement…" : registration ? "Créer mon compte" : "Enregistrer les modifications"}<ArrowRight size={17} aria-hidden="true" /></Button>
      </div>
    </form>
  </FormProvider>;
}
