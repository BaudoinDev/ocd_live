export const PAYMENT_METHODS = ["mobile_money", "card"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const paymentLabels: Record<PaymentMethod, string> = { mobile_money: "Mobile Money", card: "Carte bancaire" };
