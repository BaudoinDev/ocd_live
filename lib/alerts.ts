import "server-only";
import { formatDate, hourLabel } from "@/lib/booking-rules";
import { paymentLabels, type PaymentMethod } from "@/lib/payment";
import type { ParticipationMode, SessionSelection, User } from "@/types/domain";

export interface BookingAlert {
  reference: string;
  packageName: string;
  price: number;
  mode: ParticipationMode;
  paymentMethod: PaymentMethod;
  sessions: readonly SessionSelection[];
  client: User;
}

export function buildAlertText({ reference, packageName, price, mode, paymentMethod, sessions, client }: BookingAlert): string {
  return [
    `Nouvelle réservation ${reference}`,
    "",
    `Entreprise : ${client.business.companyName} (${client.business.city}, ${client.business.country})`,
    `Contact : ${client.firstName} ${client.lastName} · ${client.phone} · ${client.email}`,
    `Forfait : ${packageName} · ${price} FCFA`,
    `Participation : ${mode === "agency" ? "à l’agence de Lomé" : "à distance en co-host TikTok"}`,
    `Moyen de paiement choisi : ${paymentLabels[paymentMethod]}`,
    "",
    "Séances (heure de Lomé) :",
    ...sessions.map((session) => `- ${formatDate(session.date)}, ${hourLabel(session.startHour)} à ${hourLabel(session.startHour + session.durationHours)}`),
  ].join("\n");
}

/**
 * E-mails the manager through Resend. The dashboard notification is already saved at this point, so a
 * missing configuration or an e-mail failure must never fail the booking: it is only logged.
 */
export async function sendManagerAlert(alert: BookingAlert): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY, to = process.env.MANAGER_ALERT_EMAIL, from = process.env.ALERT_FROM_EMAIL;
  if (!apiKey || !to || !from) return;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: to.split(",").map((address) => address.trim()), subject: `Nouvelle réservation : ${alert.client.business.companyName}`, text: buildAlertText(alert) }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) console.error(`Alerte e-mail refusée (HTTP ${response.status}) pour ${alert.reference}.`);
  } catch {
    console.error(`Alerte e-mail non envoyée pour ${alert.reference}.`);
  }
}
