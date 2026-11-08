"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarDays, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function FeatureNotice({
  kind = "booking",
  children,
  className,
  variant = "default",
  size = "default",
}: {
  kind?: "booking" | "account";
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "ghost" | "dark";
  size?: "default" | "sm";
}) {
  const account = kind === "account";
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={className} variant={variant} size={size}>
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div className="dialog-symbol">
          {account ? <UserRound size={25} /> : <CalendarDays size={25} />}
        </div>
        <DialogHeader>
          <DialogTitle>
            {account
              ? "Votre espace arrive bientôt."
              : "Votre prochain live commence ici."}
          </DialogTitle>
          <DialogDescription>
            {account
              ? "L’espace client permettra de retrouver vos séances et de suivre vos réservations. Il n’est pas encore disponible dans cet aperçu."
              : "Découvrez nos formats de promotion et trouvez celui qui correspond à votre activité. La sélection de créneaux et la réservation en ligne seront disponibles prochainement."}
          </DialogDescription>
        </DialogHeader>
        <div className="dialog-actions">
          <DialogClose asChild>
            <Button asChild>
              <Link href="/forfaits">
                Découvrir les forfaits <ArrowUpRight size={17} />
              </Link>
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="secondary">Continuer la visite</Button>
          </DialogClose>
        </div>
        <p className="dialog-note">
          Aperçu de démonstration · Aucun compte, réservation ou paiement n’est
          créé.
        </p>
      </DialogContent>
    </Dialog>
  );
}
