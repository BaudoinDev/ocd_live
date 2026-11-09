export const SESSION_COOKIE = "ocd_session";

/** Only same-site client-area paths are accepted as a post-login destination (no open redirect). */
export function safeNextPath(next: string | null | undefined): string | null {
  return next && /^\/dashboard(?:\/|\?|$)/.test(next) && !next.includes("\\") && !next.includes("//") ? next : null;
}
