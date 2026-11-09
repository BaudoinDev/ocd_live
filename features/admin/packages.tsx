"use client";

import { useState, useTransition } from "react";
import { Pencil, Sparkles } from "lucide-react";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatPrice, type PromotionPackage } from "@/lib/packages";
import { updatePackageAction } from "./actions";
import styles from "./admin.module.css";

function PackageEditor({ offer }: { offer: PromotionPackage }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  function submit(form: FormData) {
    setError("");
    const text = (name: string) => String(form.get(name) ?? "");
    startTransition(async () => {
      const result = await updatePackageAction({
        id: offer.id, name: text("name"), description: text("description"), cadence: text("cadence"),
        price: Number(text("price")), durationHours: Number(text("durationHours")), sessionCount: Number(text("sessionCount")),
        features: text("features").split("\n").map((line) => line.trim()).filter(Boolean), recommended: form.get("recommended") === "on",
      });
      if (result.ok) setOpen(false);
      else setError(result.error);
    });
  }
  const id = (field: string) => `package-${offer.id}-${field}`;
  return <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) setError(""); }}>
    <DialogTrigger asChild><Button variant="secondary" size="sm" aria-label={`Modifier le forfait ${offer.name}`}><Pencil size={15} aria-hidden="true" />Modifier</Button></DialogTrigger>
    <DialogContent>
      <DialogHeader><DialogTitle>{offer.name}</DialogTitle><DialogDescription>Les réservations existantes conservent leur tarif d’origine.</DialogDescription></DialogHeader>
      <form action={submit} className={styles.editor}>
        <div className="form-field"><label htmlFor={id("name")}>Nom</label><input id={id("name")} name="name" className="field-input" defaultValue={offer.name} required /></div>
        <div className="form-field"><label htmlFor={id("price")}>Tarif (FCFA)</label><input id={id("price")} name="price" type="number" min={1} step={1} className="field-input" defaultValue={offer.price} required /></div>
        <div className="form-grid">
          <div className="form-field"><label htmlFor={id("durationHours")}>Durée d’une séance (h)</label><input id={id("durationHours")} name="durationHours" type="number" min={1} max={10} className="field-input" defaultValue={offer.durationHours} required /></div>
          <div className="form-field"><label htmlFor={id("sessionCount")}>Nombre de séances</label><input id={id("sessionCount")} name="sessionCount" type="number" min={1} max={31} className="field-input" defaultValue={offer.sessionCount} required /></div>
        </div>
        <div className="form-field"><label htmlFor={id("cadence")}>Rythme</label><input id={id("cadence")} name="cadence" className="field-input" defaultValue={offer.cadence} required /></div>
        <div className="form-field"><label htmlFor={id("description")}>Description</label><textarea id={id("description")} name="description" defaultValue={offer.description} required /></div>
        <div className="form-field"><label htmlFor={id("features")}>Avantages (un par ligne)</label><textarea id={id("features")} name="features" defaultValue={offer.features.join("\n")} required /></div>
        <label className={styles.checkField}><input type="checkbox" name="recommended" defaultChecked={offer.recommended} />Mettre en avant comme forfait recommandé</label>
        {error && <p role="alert" className="notice notice-error">{error}</p>}
        <div className="dialog-actions"><Button type="submit" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer"}</Button><DialogClose asChild><Button type="button" variant="secondary">Annuler</Button></DialogClose></div>
      </form>
    </DialogContent>
  </Dialog>;
}

export function AdminPackages() {
  const { state } = useWorkspace();
  return <div className={styles.stack}>
    <header className="page-heading"><div><p className="page-kicker">Votre offre</p><h1>Les forfaits.</h1><p className="page-description">Vos modifications s’appliquent immédiatement au site public et aux nouvelles réservations.</p></div></header>
    <div className={styles.packageGrid}>{state.packages.map((offer) => <article key={offer.id} className={styles.packageCard}>
      {offer.recommended && <span className={styles.unreadBadge}><Sparkles size={11} aria-hidden="true" /> Recommandé</span>}
      <h2>{offer.name}</h2>
      <p>{offer.description}</p>
      <p className={styles.packagePrice}>{formatPrice(offer.price)} <small>FCFA</small></p>
      <p className={styles.packageMeta}><span>{offer.sessionCount} séance{offer.sessionCount > 1 ? "s" : ""}</span><span>{offer.durationHours} h par séance</span></p>
      <ul className={styles.features}>{offer.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
      <PackageEditor offer={offer} />
    </article>)}</div>
  </div>;
}
