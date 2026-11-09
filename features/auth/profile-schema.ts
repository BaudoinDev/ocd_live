import { z } from "zod";
import type { ProfileInput } from "@/types/domain";

const text = (label: string, minimum = 2) =>
  z.string().trim().min(minimum, `${label} : au moins ${minimum} caractères.`).max(500, "Limitez ce champ à 500 caractères.");

const email = z.string().trim().toLowerCase().max(254, "Cette adresse email est trop longue.").email("Indiquez une adresse email valide.");

export const profileSchema = z.object({
  firstName: text("Le prénom"),
  lastName: text("Le nom"),
  email,
  phone: z.string().trim().regex(/^\+?[\d\s().-]{7,25}$/, "Indiquez un numéro de téléphone valide (7 chiffres minimum)."),
  business: z.object({
    companyName: text("Le nom de l’entreprise"),
    country: text("Le pays"),
    city: text("La ville"),
    sector: text("Le secteur d’activité"),
    description: text("La description", 10),
    products: text("Les produits ou services", 3),
    tiktok: z.string().trim().max(40, "Limitez le nom TikTok à 40 caractères.").refine((value) => value === "" || /^@?[\w.]+$/.test(value), "Indiquez un nom TikTok, par exemple @monentreprise."),
  }),
});

export const registrationSchema = profileSchema.extend({
  password: z.string().min(10, "Choisissez un mot de passe d’au moins 10 caractères.").max(128, "Limitez le mot de passe à 128 caractères."),
  passwordConfirm: z.string(),
}).refine((values) => values.password === values.passwordConfirm, { path: ["passwordConfirm"], message: "Les deux mots de passe ne correspondent pas." });

export const loginSchema = z.object({ email, password: z.string().min(1, "Renseignez votre mot de passe.").max(128, "Mot de passe trop long.") });

export type RegistrationInput = z.infer<typeof registrationSchema>;

export const emptyProfile: ProfileInput = {
  firstName: "", lastName: "", email: "", phone: "",
  business: { companyName: "", country: "", city: "", sector: "", description: "", products: "", tiktok: "" },
};
