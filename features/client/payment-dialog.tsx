"use client";

import { CreditCard, Smartphone } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { paymentLabels, type PaymentMethod } from "@/lib/payment";
import styles from "./payment-dialog.module.css";

const options: { value: PaymentMethod; detail: string; Icon: typeof CreditCard }[] = [
  { value: "mobile_money", detail: "Depuis votre téléphone", Icon: Smartphone },
  { value: "card", detail: "Visa, Mastercard…", Icon: CreditCard },
];

/** Choosing an option validates the payment straight away: there is deliberately no form and no payment check. */
export function PaymentDialog({ open, onOpenChange, offerName, amount, pending, chosen, onChoose, returnFocusRef }: {
  returnFocusRef: React.RefObject<HTMLButtonElement | null>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offerName: string;
  amount: string;
  pending: boolean;
  chosen: PaymentMethod | null;
  onChoose: (method: PaymentMethod) => void;
}) {
  return <Dialog open={open} onOpenChange={(next) => { if (!pending) onOpenChange(next); }}>
    <DialogContent className={styles.dialog} onCloseAutoFocus={(event) => { event.preventDefault(); returnFocusRef.current?.focus(); }}>
      <DialogHeader>
        <DialogTitle>Comment souhaitez-vous payer ?</DialogTitle>
        <DialogDescription>{offerName} · {amount} FCFA</DialogDescription>
      </DialogHeader>
      <div className={styles.options}>
        {options.map(({ value, detail, Icon }) => <button key={value} type="button" className={`${styles.option} ${pending && chosen === value ? styles.loading : ""}`} disabled={pending} onClick={() => onChoose(value)}>
          <span className={styles.icon}>{pending && chosen === value ? <span className={styles.spinner} aria-hidden="true" /> : <Icon size={26} aria-hidden="true" />}</span>
          <strong>{paymentLabels[value]}</strong>
          <small>{pending && chosen === value ? "Validation…" : detail}</small>
        </button>)}
      </div>
      <p className="dialog-note">Présentation : aucun montant n’est réellement débité.</p>
    </DialogContent>
  </Dialog>;
}
