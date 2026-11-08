"use client";

import { useState } from "react";
import { FormProvider, useForm, useFormContext, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProfileInput } from "@/types/demo";
import { emptyProfile, profileSchema } from "./profile-schema";
import styles from "./auth.module.css";

type FieldProps = { name: Path<ProfileInput>; label: string; type?: string; autoComplete?: string; placeholder?: string; multiline?: boolean; optional?: boolean; hint?: string };

function ProfileField({ name, label, type = "text", autoComplete, placeholder, multiline, optional, hint }: FieldProps) {
  const { register, getFieldState, formState } = useFormContext<ProfileInput>();
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

export function ProfileForm({ initialValues = emptyProfile, onSave, registration = false }: { initialValues?: ProfileInput; onSave: (values: ProfileInput) => void; registration?: boolean }) {
  const form = useForm<ProfileInput>({ resolver: zodResolver(profileSchema), defaultValues: initialValues, mode: "onTouched" });
  const [message, setMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const submit = form.handleSubmit((values) => {
    setSubmitError("");
    setMessage("");
    try {
      onSave(values);
      if (!registration) setMessage("Votre profil a bien été enregistré dans ce navigateur.");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Impossible d’enregistrer le profil. Réessayez.");
    }
  });
  return <FormProvider {...form}>
    <form onSubmit={submit} noValidate className={styles.profileForm}>
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
      {submitError && <div role="alert" className="notice notice-error">{submitError}</div>}
      {message && <div role="status" className="notice notice-success"><Check size={18} aria-hidden="true" /> {message}</div>}
      <div className={`form-actions ${styles.formActions}`}>
        <p className="form-hint">{registration ? "Tous les champs sont requis, sauf le nom TikTok. Données enregistrées uniquement dans ce navigateur." : "Les modifications s’appliquent à votre profil de démonstration."}</p>
        <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Enregistrement…" : registration ? "Créer mon compte démo" : "Enregistrer les modifications"}<ArrowRight size={17} aria-hidden="true" /></Button>
      </div>
    </form>
  </FormProvider>;
}
