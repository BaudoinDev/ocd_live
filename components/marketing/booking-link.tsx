import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Primary calls to action. Visitors without a session are sent to the login page, then back to booking. */
export function BookingLink({ kind = "booking", children, className, variant = "default", size = "default", onClick }: {
  kind?: "booking" | "account";
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "ghost" | "dark";
  size?: "default" | "sm";
  onClick?: () => void;
}) {
  return <Button asChild className={className} variant={variant} size={size}><Link href={kind === "account" ? "/connexion" : "/dashboard/reserver"} onClick={onClick}>{children}</Link></Button>;
}
