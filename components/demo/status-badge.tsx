import type { BookingStatus } from "@/types/demo";

export const statusLabels: Record<BookingStatus, string> = { pending: "En attente", confirmed: "Confirmée", cancelled: "Annulée", completed: "Terminée" };
export function StatusBadge({ status }: { status: BookingStatus }) { return <span className={`status-badge status-${status}`}><span aria-hidden="true" />{statusLabels[status]}</span>; }
