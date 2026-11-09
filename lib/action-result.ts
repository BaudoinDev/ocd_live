export type ActionResult<T = undefined> = { ok: true; value: T } | { ok: false; error: string };

export const success = <T>(value: T): ActionResult<T> => ({ ok: true, value });
export const done: ActionResult = { ok: true, value: undefined };
export const failure = (error: string): { ok: false; error: string } => ({ ok: false, error });

export const UNEXPECTED_ERROR = "Une erreur est survenue. Réessayez dans un instant.";

/** The PostgreSQL error code, whether the driver throws it directly or Drizzle wraps it. */
export function databaseErrorCode(error: unknown): string | undefined {
  const source = error as { code?: unknown; cause?: { code?: unknown } } | null;
  const code = source?.code ?? source?.cause?.code;
  return typeof code === "string" ? code : undefined;
}

export const UNIQUE_VIOLATION = "23505";
export const EXCLUSION_VIOLATION = "23P01";
