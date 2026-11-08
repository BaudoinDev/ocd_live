import { z } from "zod";
import type { ProfileInput } from "@/types/demo";

const text = (label: string, minimum = 2) =>
  z.string().trim().min(minimum, `${label} : au moins ${minimum} caractères.`).max(500, "Limitez ce champ à 500 caractères.");

export const profileSchema = z.object({
  firstName: text("Le prénom"),
  lastName: text("Le nom"),
  email: z.string().trim().email("Indiquez une adresse email valide."),
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

export const emptyProfile: ProfileInput = {
  firstName: "", lastName: "", email: "", phone: "",
  business: { companyName: "", country: "", city: "", sector: "", description: "", products: "", tiktok: "" },
};
