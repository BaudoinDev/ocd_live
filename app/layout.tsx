import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
// Shared styles for the client and admin workspaces. Kept in the root layout so CSS order stays deterministic across navigations.
import "./workspace.css";

const outfit = localFont({
  src: "../public/fonts/Outfit-VariableFont_wght.ttf",
  variable: "--font-outfit",
  weight: "400 800",
  display: "swap",
});

const dmSans = localFont({
  src: "../public/fonts/DMSans-VariableFont_opsz,wght.ttf",
  variable: "--font-dm-sans",
  weight: "400 700",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "OCD Live — Votre business mérite d’être vu",
    template: "%s | OCD Live",
  },
  description:
    "Donnez de la visibilité à votre entreprise avec les promotions TikTok Live d’OCD. À l’agence de Lomé ou à distance, mettez votre activité au premier plan.",
  applicationName: "OCD Live",
  icons: { icon: "/images/Orange%20OCD%20Live%20Logo.png" },
  openGraph: {
    locale: "fr_FR",
    type: "website",
    siteName: "OCD Live",
    title: "OCD Live — Les opportunités, c’est dehors.",
    description:
      "Votre entreprise, ses produits, son histoire. Faites-les découvrir en TikTok Live, à Lomé ou à distance.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      className={`${outfit.variable} ${dmSans.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
